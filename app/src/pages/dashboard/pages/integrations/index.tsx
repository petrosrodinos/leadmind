import { useState, type ComponentType } from "react";
import { Button, Chip } from "@heroui/react";
import {
    Bot,
    Cloud,
    KeyRound,
    Mail,
    MessageSquare,
    Plug,
    Sparkles,
} from "lucide-react";
import { useIntegrations } from "@/features/integrations/hooks/use-integrations";
import type { IntegrationProviderView } from "@/features/integrations/interfaces/integrations.interface";
import { IntegrationDetailModal } from "./components/integration-detail-modal";
import { IntegrationKeyFormModal } from "./components/integration-key-form-modal";

const providerIcons: Record<string, ComponentType<{ className?: string }>> = {
    OPENAI: Sparkles,
    ANTHROPIC: Bot,
    RESEND: Mail,
    TWILIO: MessageSquare,
    APIFY: Cloud,
    HUBSPOT: Plug,
};

const FALLBACK_PROVIDERS: IntegrationProviderView[] = [
    {
        provider: "OPENAI",
        uuid: null,
        label: "OpenAI",
        description: "GPT models for enrichment, scoring, and message drafting.",
        keyTypes: [{ key_type: "API_KEY", label: "API key", placeholder: "sk-..." }],
        keys: [],
    },
    {
        provider: "ANTHROPIC",
        uuid: null,
        label: "Anthropic",
        description: "Claude models for AI workflows.",
        keyTypes: [{ key_type: "API_KEY", label: "API key", placeholder: "sk-ant-..." }],
        keys: [],
    },
    {
        provider: "RESEND",
        uuid: null,
        label: "Resend",
        description: "Transactional email and inbound webhooks.",
        keyTypes: [
            { key_type: "API_KEY", label: "API key", placeholder: "re_..." },
            {
                key_type: "WEBHOOK_SECRET",
                label: "Webhook secret",
                placeholder: "whsec_...",
            },
        ],
        keys: [],
    },
    {
        provider: "TWILIO",
        uuid: null,
        label: "Twilio",
        description: "SMS outreach credentials.",
        keyTypes: [
            { key_type: "ACCOUNT_SID", label: "Account SID", placeholder: "AC..." },
            { key_type: "AUTH_TOKEN", label: "Auth token", placeholder: "Auth token" },
        ],
        keys: [],
    },
    {
        provider: "APIFY",
        uuid: null,
        label: "Apify",
        description: "Lead scraping from LinkedIn, Google Maps, and more.",
        keyTypes: [{ key_type: "API_KEY", label: "API token", placeholder: "apify_api_..." }],
        keys: [],
    },
    {
        provider: "HUBSPOT",
        uuid: null,
        label: "HubSpot",
        description: "CRM sync and marketing automation.",
        keyTypes: [
            {
                key_type: "ACCESS_TOKEN",
                label: "Access token",
                placeholder: "pat-...",
            },
        ],
        keys: [],
    },
];

export default function IntegrationsPage() {
    const { data, isLoading } = useIntegrations();
    const [selected, setSelected] = useState<IntegrationProviderView | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [quickAdd, setQuickAdd] = useState<IntegrationProviderView | null>(null);

    const providers = data ?? FALLBACK_PROVIDERS;

    const resolveProvider = (provider: IntegrationProviderView) =>
        data?.find((row) => row.provider === provider.provider) ?? provider;

    const openDetail = (providerView: IntegrationProviderView) => {
        setSelected(resolveProvider(providerView));
        setDetailOpen(true);
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-xl font-semibold text-foreground">
                    Integrations
                </h1>
                <p className="text-sm text-muted max-w-2xl">
                    Store keys per provider. Use the same account name for related
                    secrets, e.g.{" "}
                    <span className="font-mono">RESEND_API_KEY_1</span> and{" "}
                    <span className="font-mono">RESEND_WEBHOOK_SECRET_1</span>.
                </p>
            </header>

            {isLoading ? (
                <SkeletonGrid />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {providers.map((providerView) => (
                        <IntegrationCard
                            key={providerView.provider}
                            providerView={providerView}
                            onOpen={() => openDetail(providerView)}
                            onQuickAdd={() =>
                                setQuickAdd(resolveProvider(providerView))
                            }
                        />
                    ))}
                </div>
            )}

            <IntegrationDetailModal
                isOpen={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setSelected(null);
                }}
                providerView={selected ? resolveProvider(selected) : null}
            />

            {quickAdd && (
                <IntegrationKeyFormModal
                    isOpen={!!quickAdd}
                    onOpenChange={(open) => {
                        if (!open) setQuickAdd(null);
                    }}
                    providerView={quickAdd}
                />
            )}
        </div>
    );
}

function IntegrationCard({
    providerView,
    onOpen,
    onQuickAdd,
}: {
    providerView: IntegrationProviderView;
    onOpen: () => void;
    onQuickAdd: () => void;
}) {
    const Icon = providerIcons[providerView.provider];
    const keyCount = providerView.keys.length;
    const accountCount = new Set(providerView.keys.map((row) => row.account)).size;
    const configured = keyCount > 0;

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen();
                }
            }}
            className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-4 hover:shadow-sm hover:border-accent/30 transition-all cursor-pointer text-left"
        >
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                    <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                            {providerView.label}
                        </h3>
                        <Chip
                            size="sm"
                            variant="soft"
                            color={configured ? "success" : "default"}
                        >
                            <Chip.Label>
                                {configured ? "Configured" : "Not set up"}
                            </Chip.Label>
                        </Chip>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mt-1">
                        {providerView.description}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                <span className="text-xs text-muted flex items-center gap-1.5">
                    <KeyRound className="size-3.5" />
                    {keyCount === 0
                        ? "No keys"
                        : `${keyCount} key${keyCount === 1 ? "" : "s"} · ${accountCount} account${accountCount === 1 ? "" : "s"}`}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onPress={onQuickAdd}>
                        Add key
                    </Button>
                </span>
            </div>
        </article>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-border bg-surface p-4 space-y-3 animate-pulse h-40"
                />
            ))}
        </div>
    );
}
