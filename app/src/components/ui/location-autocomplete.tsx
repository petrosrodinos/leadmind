import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@heroui/react";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotonProperties {
    name?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    type?: string;
    osm_value?: string;
}

interface PhotonFeature {
    properties: PhotonProperties;
    geometry?: { coordinates: [number, number] };
}

interface PhotonResponse {
    features: PhotonFeature[];
}

interface LocationSuggestion {
    key: string;
    display: string;
}

interface LocationAutocompleteProps {
    value: string;
    onChange: (next: string) => void;
    id?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    /** ISO 639-1 language code passed to Photon. Default: "en". */
    lang?: string;
    /** Min chars before we hit the API. Default: 2. */
    minChars?: number;
    /** Debounce ms. Default: 250. */
    debounceMs?: number;
    "aria-label"?: string;
}

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";

/**
 * Photon returns rich properties; fold them into a clean string that resolves
 * in Nominatim (which is what the Apify Google Maps actor uses for geocoding).
 */
function formatSuggestion(p: PhotonProperties): string {
    const parts: string[] = [];
    if (p.name) parts.push(p.name);
    // Add city if it adds info beyond `name` (e.g. for a museum inside a city).
    if (p.city && p.city !== p.name) parts.push(p.city);
    if (p.state && !parts.includes(p.state)) parts.push(p.state);
    if (p.country && !parts.includes(p.country)) parts.push(p.country);
    return parts.join(", ");
}

export function LocationAutocomplete({
    value,
    onChange,
    id,
    placeholder = "Start typing a city or region…",
    className,
    disabled,
    lang = "en",
    minChars = 2,
    debounceMs = 250,
    "aria-label": ariaLabel,
}: LocationAutocompleteProps) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const listboxId = `${inputId}-listbox`;

    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    /** Tracks the last text we resolved to avoid re-querying after a pick. */
    const lastResolvedRef = useRef<string>("");

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            abortRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const fetchSuggestions = (q: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        const params = new URLSearchParams({
            q,
            lang,
            limit: "5",
        });

        fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
        })
            .then(
                (r) =>
                    (r.ok ? r.json() : { features: [] }) as Promise<PhotonResponse>,
            )
            .then((res) => {
                const seen = new Set<string>();
                const items: LocationSuggestion[] = [];
                for (const f of res.features ?? []) {
                    const display = formatSuggestion(f.properties ?? {});
                    if (!display || seen.has(display)) continue;
                    seen.add(display);
                    items.push({ key: display, display });
                }
                setSuggestions(items);
                setHighlight(items.length > 0 ? 0 : -1);
                setOpen(true);
            })
            .catch((err) => {
                if ((err as Error).name === "AbortError") return;
                setSuggestions([]);
                setHighlight(-1);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
    };

    const handleInputChange = (next: string) => {
        onChange(next);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const trimmed = next.trim();
        if (trimmed.length < minChars) {
            setSuggestions([]);
            setOpen(false);
            setHighlight(-1);
            setLoading(false);
            abortRef.current?.abort();
            return;
        }

        // If the user just picked a suggestion and didn't change the text,
        // don't re-query.
        if (trimmed === lastResolvedRef.current) {
            setOpen(false);
            return;
        }

        debounceTimer.current = setTimeout(() => fetchSuggestions(trimmed), debounceMs);
    };

    const pick = (s: LocationSuggestion) => {
        lastResolvedRef.current = s.display;
        onChange(s.display);
        setSuggestions([]);
        setOpen(false);
        setHighlight(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
        } else if (e.key === "Enter") {
            if (highlight >= 0) {
                e.preventDefault();
                pick(suggestions[highlight]!);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <div className="relative">
                <MapPin className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                    id={inputId}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        highlight >= 0 ? `${listboxId}-opt-${highlight}` : undefined
                    }
                    aria-label={ariaLabel}
                    autoComplete="off"
                    className="pl-9 pr-9"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length > 0) setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                {loading && (
                    <Loader2 className="size-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                )}
            </div>

            {open && suggestions.length > 0 && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-surface shadow-lg py-1"
                >
                    {suggestions.map((s, i) => (
                        <li
                            key={`${s.key}-${i}`}
                            id={`${listboxId}-opt-${i}`}
                            role="option"
                            aria-selected={i === highlight}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                pick(s);
                            }}
                            onMouseEnter={() => setHighlight(i)}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer flex items-start gap-2",
                                i === highlight
                                    ? "bg-accent/15 text-foreground"
                                    : "text-foreground hover:bg-surface-secondary",
                            )}
                        >
                            <MapPin className="size-3.5 mt-0.5 shrink-0 text-muted" />
                            <span className="line-clamp-2">{s.display}</span>
                        </li>
                    ))}
                </ul>
            )}

            {open && !loading && suggestions.length === 0 && value.trim().length >= minChars && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg py-2 px-3 text-sm text-muted">
                    No matches. Try a simpler form (e.g. "City, Country").
                </div>
            )}
        </div>
    );
}
