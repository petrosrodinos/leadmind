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
import { integrationProviderDefinitions } from "@/features/integrations/constants/integrations.catalog";
import { IntegrationDetailModal } from "./components/integration-detail-modal";
import { IntegrationCredentialFormModal } from "./components/integration-credential-form-modal";

const providerIcons: Record<string, ComponentType<{ className?: string }>> = {
    OPENAI: Sparkles,
    ANTHROPIC: Bot,
    RESEND: Mail,
    TWILIO: MessageSquare,
    APIFY: Cloud,
    HUBSPOT: Plug,
};

export default function IntegrationsPage() {
    const { data, isLoading } = useIntegrations();
    const [selected, setSelected] = useState<IntegrationProviderView | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [quickAddProvider, setQuickAddProvider] =
        useState<IntegrationProviderView | null>(null);

    const providers = data ?? integrationProviderDefinitions.map((definition) => ({
        ...definition,
        credentials: [],
    }));

    const openDetail = (providerView: IntegrationProviderView) => {
        setSelected(providerView);
        setDetailOpen(true);
    };

    const openQuickAdd = (providerView: IntegrationProviderView) => {
        setQuickAddProvider(providerView);
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-xl font-semibold text-foreground">
                    Integrations
                </h1>
                <p className="text-sm text-muted max-w-2xl">
                    Store credentials per provider. Group related secrets under the
                    same account, e.g. <span className="font-mono">RESEND_API_KEY_1</span>{" "}
                    and <span className="font-mono">RESEND_WEBHOOK_SECRET_1</span>.
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
                            onQuickAdd={() => openQuickAdd(providerView)}
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
                providerView={
                    selected
                        ? (data?.find(
                              (row) => row.provider === selected.provider,
                          ) ?? selected)
                        : null
                }
            />

            {quickAddProvider && (
                <IntegrationCredentialFormModal
                    isOpen={!!quickAddProvider}
                    onOpenChange={(open) => {
                        if (!open) setQuickAddProvider(null);
                    }}
                    provider={quickAddProvider.provider}
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
    const credentialCount = providerView.credentials.length;
    const accountCount = new Set(
        providerView.credentials.map((row) => row.account),
    ).size;
    const configured = credentialCount > 0;

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
                    {credentialCount === 0
                        ? "No credentials"
                        : `${credentialCount} credential${credentialCount === 1 ? "" : "s"} · ${accountCount} account${accountCount === 1 ? "" : "s"}`}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onPress={onQuickAdd}>
                        Add credential
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
