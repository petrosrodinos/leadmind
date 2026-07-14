import { useState, type ComponentType } from "react";
import { Button, Chip } from "@heroui/react";
import {
    Cloud,
    KeyRound,
    Mail,
    MessageSquare,
    Plug,
    Server,
    Sparkles,
} from "lucide-react";
import {
    canShowAddKeyButton,
    countSendableEmailAccounts,
    DISABLED_INTEGRATION_PROVIDERS,
    suggestNextAccountLabel,
} from "@/features/integrations/constants/integration-key-types";
import { useIntegrations } from "@/features/integrations/hooks/use-integrations";
import type { IntegrationProviderView } from "@/features/integrations/interfaces/integrations.interface";
import { IntegrationDetailModal } from "./components/integration-detail-modal";
import { IntegrationKeyFormModal } from "./components/integration-key-form-modal";
import { ResendAccountFormModal } from "./components/resend-account-form-modal";
import { SmtpAccountFormModal } from "./components/smtp-account-form-modal";

const providerIcons: Record<string, ComponentType<{ className?: string }>> = {
    OPENAI: Sparkles,
    RESEND: Mail,
    SMTP: Server,
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
        default_account: null,
        keyTypes: [
            { key_type: "API_KEY", label: "API key", placeholder: "sk-..." },
            {
                key_type: "WEBHOOK_SECRET",
                label: "Webhook secret",
                placeholder: "whsec_...",
            },
        ],
        keys: [],
    },
    {
        provider: "RESEND",
        uuid: null,
        label: "Resend",
        description:
            "Transactional email and inbound webhooks. Add API key and from address per account.",
        allows_multiple_accounts: true,
        supports_default_account_selection: true,
        default_account: null,
        keyTypes: [
            { key_type: "API_KEY", label: "API key", placeholder: "re_..." },
            {
                key_type: "FROM_EMAIL",
                label: "From email",
                placeholder: "noreply@example.com",
            },
            {
                key_type: "WEBHOOK_SECRET",
                label: "Webhook secret",
                placeholder: "whsec_...",
            },
        ],
        keys: [],
    },
    {
        provider: "SMTP",
        uuid: null,
        label: "SMTP",
        description:
            "Custom SMTP servers for outbound email. Add multiple accounts with host, port, username, password, and from address.",
        allows_multiple_accounts: true,
        supports_default_account_selection: true,
        default_account: null,
        keyTypes: [
            { key_type: "HOST", label: "Host", placeholder: "smtp.example.com" },
            { key_type: "PORT", label: "Port", placeholder: "587" },
            { key_type: "USERNAME", label: "Username", placeholder: "user@example.com" },
            { key_type: "PASSWORD", label: "Password", placeholder: "App password" },
            {
                key_type: "FROM_EMAIL",
                label: "From email",
                placeholder: "noreply@example.com",
            },
        ],
        keys: [],
    },
    {
        provider: "TWILIO",
        uuid: null,
        label: "Twilio",
        description: "SMS outreach credentials.",
        disabled: true,
        default_account: null,
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
        default_account: null,
        keyTypes: [{ key_type: "API_KEY", label: "API token", placeholder: "apify_api_..." }],
        keys: [],
    },
    {
        provider: "HUBSPOT",
        uuid: null,
        label: "HubSpot",
        description: "CRM sync and marketing automation.",
        disabled: true,
        default_account: null,
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

function isProviderDisabled(providerView: IntegrationProviderView): boolean {
    return (
        providerView.disabled ??
        DISABLED_INTEGRATION_PROVIDERS.includes(providerView.provider)
    );
}

export default function IntegrationsPage() {
    const { data, isLoading } = useIntegrations();
    const [selected, setSelected] = useState<IntegrationProviderView | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [quickAdd, setQuickAdd] = useState<IntegrationProviderView | null>(null);
    const [smtpQuickAdd, setSmtpQuickAdd] = useState<IntegrationProviderView | null>(null);
    const [resendQuickAdd, setResendQuickAdd] = useState<IntegrationProviderView | null>(null);

    const providers = (data ?? FALLBACK_PROVIDERS).filter(
        (providerView) => providerView.provider !== "ANTHROPIC",
    );

    const resolveProvider = (provider: IntegrationProviderView) =>
        providers.find((row) => row.provider === provider.provider) ?? provider;

    const openDetail = (providerView: IntegrationProviderView) => {
        if (isProviderDisabled(providerView)) return;
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
                    Connect API keys for AI, email, and scraping. Resend and SMTP
                    support multiple accounts — use account labels like{" "}
                    <span className="font-mono">1</span>,{" "}
                    <span className="font-mono">2</span>, or{" "}
                    <span className="font-mono">production</span>. Pick a default
                    account for outbound email, or choose a provider when sending.
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
                            disabled={isProviderDisabled(providerView)}
                            onOpen={() => openDetail(providerView)}
                            onQuickAdd={() => {
                                if (isProviderDisabled(providerView)) return;
                                const resolved = resolveProvider(providerView);
                                if (resolved.provider === "SMTP") {
                                    setSmtpQuickAdd(resolved);
                                    return;
                                }
                                if (resolved.provider === "RESEND") {
                                    setResendQuickAdd(resolved);
                                    return;
                                }
                                setQuickAdd(resolved);
                            }}
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
                    initialAccount={suggestNextAccountLabel(quickAdd.keys)}
                />
            )}

            {resendQuickAdd && (
                <ResendAccountFormModal
                    isOpen={!!resendQuickAdd}
                    onOpenChange={(open) => {
                        if (!open) setResendQuickAdd(null);
                    }}
                    providerView={resendQuickAdd}
                />
            )}

            {smtpQuickAdd && (
                <SmtpAccountFormModal
                    isOpen={!!smtpQuickAdd}
                    onOpenChange={(open) => {
                        if (!open) setSmtpQuickAdd(null);
                    }}
                    providerView={smtpQuickAdd}
                />
            )}
        </div>
    );
}

function IntegrationCard({
    providerView,
    disabled,
    onOpen,
    onQuickAdd,
}: {
    providerView: IntegrationProviderView;
    disabled: boolean;
    onOpen: () => void;
    onQuickAdd: () => void;
}) {
    const Icon = providerIcons[providerView.provider];
    const keyCount = providerView.keys.length;
    const accountCount = new Set(providerView.keys.map((row) => row.account)).size;
    const sendableAccountCount = countSendableEmailAccounts(providerView);
    const configured = keyCount > 0;
    const showAddKey = canShowAddKeyButton(providerView);
    const isEmailProvider =
        providerView.provider === "RESEND" || providerView.provider === "SMTP";

    return (
        <article
            role={disabled ? undefined : "button"}
            tabIndex={disabled ? undefined : 0}
            onClick={disabled ? undefined : onOpen}
            onKeyDown={
                disabled
                    ? undefined
                    : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onOpen();
                          }
                      }
            }
            className={`rounded-xl border border-border bg-surface p-4 flex flex-col gap-4 transition-all text-left ${
                disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-sm hover:border-accent/30 cursor-pointer"
            }`}
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
                            color={
                                disabled
                                    ? "default"
                                    : configured
                                      ? "success"
                                      : "default"
                            }
                        >
                            <Chip.Label>
                                {disabled
                                    ? "Coming soon"
                                    : configured
                                      ? "Configured"
                                      : "Not set up"}
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
                    {disabled
                        ? "Unavailable"
                        : keyCount === 0
                          ? "No keys"
                          : isEmailProvider && sendableAccountCount > 0
                            ? `${sendableAccountCount} sendable account${sendableAccountCount === 1 ? "" : "s"} · ${keyCount} key${keyCount === 1 ? "" : "s"}`
                            : `${keyCount} key${keyCount === 1 ? "" : "s"} · ${accountCount} account${accountCount === 1 ? "" : "s"}`}
                </span>
                {!disabled && showAddKey && (
                    <span onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="secondary" onPress={onQuickAdd}>
                            {providerView.provider === "SMTP"
                                ? "Add account"
                                : "Add key"}
                        </Button>
                    </span>
                )}
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
