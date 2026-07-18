import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
    value: string;
    label?: string;
}

interface MultiSelectProps {
    options: ReadonlyArray<string | MultiSelectOption>;
    value: string[];
    onChange: (next: string[]) => void;
    id?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
    selectionMode?: "multiple" | "single";
    /** Cap the rendered option list while the search is empty. Default: 200. */
    maxRendered?: number;
    "aria-label"?: string;
}

const toOption = (o: string | MultiSelectOption): MultiSelectOption =>
    typeof o === "string" ? { value: o, label: o } : { label: o.value, ...o };

export function MultiSelect({
    options,
    value,
    onChange,
    id,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    className,
    disabled,
    selectionMode = "multiple",
    maxRendered = 200,
    "aria-label": ariaLabel,
}: MultiSelectProps) {
    const single = selectionMode === "single";
    const reactId = useId();
    const inputId = id ?? reactId;
    const listboxId = `${inputId}-listbox`;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const normalized = useMemo(() => options.map(toOption), [options]);
    const labelByValue = useMemo(() => {
        const m = new Map<string, string>();
        for (const o of normalized) m.set(o.value, o.label ?? o.value);
        return m;
    }, [normalized]);

    const selectedSet = useMemo(() => new Set(value), [value]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return normalized.slice(0, maxRendered);
        return normalized
            .filter((o) => (o.label ?? o.value).toLowerCase().includes(q))
            .slice(0, maxRendered);
    }, [normalized, query, maxRendered]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        setHighlight(0);
    }, [query, open]);

    const toggle = (val: string) => {
        if (single) {
            onChange(selectedSet.has(val) ? [] : [val]);
            setOpen(false);
            setQuery("");
            return;
        }
        if (selectedSet.has(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const remove = (val: string) => {
        onChange(value.filter((v) => v !== val));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (filtered.length === 0) return;
            setHighlight((h) => (h + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (filtered.length === 0) return;
            setHighlight((h) => (h <= 0 ? filtered.length - 1 : h - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const opt = filtered[highlight];
            if (opt) toggle(opt.value);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setQuery("");
        } else if (e.key === "Backspace" && query === "" && value.length > 0) {
            remove(value[value.length - 1]!);
        }
    };

    const selectedOverflow = normalized.length - filtered.length;

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                id={inputId}
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={() => !disabled && setOpen((o) => !o)}
                className={cn(
                    "w-full min-h-10 rounded-lg border border-border bg-surface px-2 py-1.5",
                    "flex flex-wrap items-center gap-1.5 text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    disabled && "opacity-60 cursor-not-allowed",
                    !disabled && "cursor-pointer hover:border-border-strong",
                )}
            >
                {value.length === 0 && (
                    <span className="text-muted text-sm pl-1">{placeholder}</span>
                )}
                {value.map((val) => (
                    <span
                        key={val}
                        className="inline-flex items-center gap-1 rounded-md bg-accent/15 text-foreground text-xs px-2 py-0.5"
                    >
                        {labelByValue.get(val) ?? val}
                        <span
                            role="button"
                            aria-label={`Remove ${labelByValue.get(val) ?? val}`}
                            tabIndex={-1}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!disabled) remove(val);
                            }}
                            className="hover:text-danger cursor-pointer"
                        >
                            <X className="size-3" />
                        </span>
                    </span>
                ))}
                <ChevronDown
                    className={cn(
                        "size-4 text-muted ml-auto shrink-0 transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
                    <div className="relative border-b border-border">
                        <Search className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            role="searchbox"
                            aria-controls={listboxId}
                            placeholder={searchPlaceholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent pl-9 pr-3 py-2 text-sm outline-none"
                        />
                    </div>

                    <ul
                        id={listboxId}
                        role="listbox"
                        aria-multiselectable={!single}
                        className="max-h-64 overflow-y-auto overscroll-contain py-1"
                    >
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-muted">No matches.</li>
                        ) : (
                            filtered.map((opt, i) => {
                                const checked = selectedSet.has(opt.value);
                                return (
                                    <li
                                        key={opt.value}
                                        role="option"
                                        aria-selected={checked}
                                        onMouseEnter={() => setHighlight(i)}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            toggle(opt.value);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2",
                                            i === highlight
                                                ? "bg-accent/15 text-foreground"
                                                : "text-foreground hover:bg-surface-secondary",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "size-4 rounded border flex items-center justify-center shrink-0",
                                                checked
                                                    ? "bg-accent border-accent"
                                                    : "border-border",
                                            )}
                                        >
                                            {checked && (
                                                <svg
                                                    viewBox="0 0 12 12"
                                                    className="size-3 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="truncate">{opt.label ?? opt.value}</span>
                                    </li>
                                );
                            })
                        )}
                        {!query && selectedOverflow > 0 && (
                            <li className="px-3 py-2 text-xs text-muted italic border-t border-border">
                                Showing {filtered.length} of {normalized.length}. Type to search.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
