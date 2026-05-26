import { useMemo, useState, type ComponentType } from "react";
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
import type {
    Integration,
    IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interface";
import {
    integrationProviderMeta,
    integrationProviderOrder,
} from "@/features/integrations/constants/integration-providers";
import { IntegrationDetailModal } from "./components/integration-detail-modal";
import { IntegrationKeyFormModal } from "./components/integration-key-form-modal";

const providerIcons: Record<
    IntegrationProvider,
    ComponentType<{ className?: string }>
> = {
    OPENAI: Sparkles,
    ANTHROPIC: Bot,
    RESEND: Mail,
    TWILIO: MessageSquare,
    APIFY: Cloud,
    HUBSPOT: Plug,
};

export default function IntegrationsPage() {
    const { data, isLoading } = useIntegrations();
    const [selected, setSelected] = useState<Integration | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [quickAddProvider, setQuickAddProvider] =
        useState<IntegrationProvider | null>(null);

    const integrationsByProvider = useMemo(() => {
        const map = new Map<IntegrationProvider, Integration>();
        for (const row of data ?? []) {
            map.set(row.provider, row);
        }
        return integrationProviderOrder.map(
            (provider) =>
                map.get(provider) ?? {
                    provider,
                    uuid: null,
                    title: null,
                    keys: [],
                },
        );
    }, [data]);

    const openDetail = (integration: Integration) => {
        setSelected(integration);
        setDetailOpen(true);
    };

    const openQuickAdd = (integration: Integration) => {
        setQuickAddProvider(integration.provider);
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-xl font-semibold text-foreground">
                    Integrations
                </h1>
                <p className="text-sm text-muted max-w-2xl">
                    Store API keys and credentials for external services. Each
                    integration supports multiple named keys.
                </p>
            </header>

            {isLoading ? (
                <SkeletonGrid />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {integrationsByProvider.map((integration) => (
                        <IntegrationCard
                            key={integration.provider}
                            integration={integration}
                            onOpen={() => openDetail(integration)}
                            onQuickAdd={() => openQuickAdd(integration)}
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
                integration={
                    selected
                        ? (data?.find((row) => row.provider === selected.provider) ??
                          selected)
                        : null
                }
            />

            {quickAddProvider && (
                <IntegrationKeyFormModal
                    isOpen={!!quickAddProvider}
                    onOpenChange={(open) => {
                        if (!open) setQuickAddProvider(null);
                    }}
                    provider={quickAddProvider}
                />
            )}
        </div>
    );
}

function IntegrationCard({
    integration,
    onOpen,
    onQuickAdd,
}: {
    integration: Integration;
    onOpen: () => void;
    onQuickAdd: () => void;
}) {
    const meta = integrationProviderMeta[integration.provider];
    const Icon = providerIcons[integration.provider];
    const keyCount = integration.keys.length;
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
                            {meta.label}
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
                        {meta.description}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                <span className="text-xs text-muted flex items-center gap-1.5">
                    <KeyRound className="size-3.5" />
                    {keyCount === 0
                        ? "No keys"
                        : `${keyCount} key${keyCount === 1 ? "" : "s"}`}
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
