import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Input, ListBox, Select, Spinner, TextField } from "@heroui/react";
import { Mail, Search } from "lucide-react";
import { Channel, MsgStatus } from "@/features/contacts/interfaces/contact.interface";
import { useSendHistory } from "@/features/outreach/hooks/use-send-history";
import {
    EmailIntegrationProvider,
    SendSource,
} from "@/features/outreach/interfaces/send-history.interface";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCampaigns } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import { SendHistoryTable } from "./components/send-history-table";

const PAGE_SIZE = 25;

const CHANNEL_OPTIONS = [
    { id: "", label: "All channels" },
    { id: Channel.EMAIL, label: "Email" },
    { id: Channel.SMS, label: "SMS" },
];

const SOURCE_OPTIONS = [
    { id: "", label: "All sources" },
    { id: SendSource.DIRECT, label: "Direct contact" },
    { id: SendSource.CAMPAIGN, label: "Campaign" },
];

const STATUS_OPTIONS = [
    { id: "", label: "All statuses" },
    { id: MsgStatus.SENT, label: "Sent" },
    { id: MsgStatus.DELIVERED, label: "Delivered" },
    { id: MsgStatus.OPENED, label: "Opened" },
    { id: MsgStatus.CLICKED, label: "Clicked" },
    { id: MsgStatus.REPLIED, label: "Replied" },
    { id: MsgStatus.FAILED, label: "Failed" },
    { id: MsgStatus.BOUNCED, label: "Bounced" },
    { id: MsgStatus.UNSUBSCRIBED, label: "Unsubscribed" },
    { id: MsgStatus.SKIPPED, label: "Skipped" },
];

const PROVIDER_OPTIONS = [
    { id: "", label: "All integrations" },
    { id: EmailIntegrationProvider.RESEND, label: "Resend" },
    { id: EmailIntegrationProvider.SMTP, label: "SMTP" },
];

export default function SendHistoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";
    const channel = searchParams.get("channel") ?? "";
    const source = searchParams.get("source") ?? "";
    const status = searchParams.get("status") ?? "";
    const emailProvider = searchParams.get("email_provider") ?? "";
    const campaignUuid = searchParams.get("campaign_uuid") ?? "";

    const debouncedSearch = useDebouncedValue(search, 300);

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const query = useMemo(
        () => ({
            page,
            limit: PAGE_SIZE,
            history_only: true,
            search: debouncedSearch || undefined,
            channel: (channel as typeof Channel.EMAIL) || undefined,
            source: (source as typeof SendSource.DIRECT) || undefined,
            status: (status as typeof MsgStatus.SENT) || undefined,
            email_provider:
                (emailProvider as typeof EmailIntegrationProvider.RESEND) || undefined,
            campaign_uuid: campaignUuid || undefined,
        }),
        [
            page,
            debouncedSearch,
            channel,
            source,
            status,
            emailProvider,
            campaignUuid,
        ],
    );

    const { data, isLoading, isFetching } = useSendHistory(query);
    const { data: campaignsData } = useCampaigns({ limit: 100 });

    const rows = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const campaignOptions = useMemo(
        () => [
            { id: "", label: "All campaigns" },
            ...(campaignsData?.data ?? []).map((campaign) => ({
                id: campaign.uuid,
                label: campaign.name,
            })),
        ],
        [campaignsData?.data],
    );

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <div className="flex items-center gap-2">
                    <Mail className="size-5 text-muted" />
                    <h1 className="text-xl font-semibold text-foreground">Send history</h1>
                </div>
                <p className="text-sm text-muted max-w-2xl">
                    Every email and SMS sent to a contact or through a campaign, including which
                    integration delivered it.
                </p>
            </header>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="w-72 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                    <TextField name="search" className="w-full">
                        <Input
                            className="pl-9"
                            placeholder="Search contact name, email, or phone"
                            value={search}
                            onChange={(e) =>
                                updateParams({ search: e.target.value || null, page: "1" })
                            }
                        />
                    </TextField>
                </div>

                <FilterSelect
                    label="Channel"
                    value={channel}
                    options={CHANNEL_OPTIONS}
                    onChange={(value) => updateParams({ channel: value || null, page: "1" })}
                />

                <FilterSelect
                    label="Source"
                    value={source}
                    options={SOURCE_OPTIONS}
                    onChange={(value) => updateParams({ source: value || null, page: "1" })}
                />

                <FilterSelect
                    label="Status"
                    value={status}
                    options={STATUS_OPTIONS}
                    onChange={(value) => updateParams({ status: value || null, page: "1" })}
                />

                <FilterSelect
                    label="Integration"
                    value={emailProvider}
                    options={PROVIDER_OPTIONS}
                    onChange={(value) =>
                        updateParams({ email_provider: value || null, page: "1" })
                    }
                />

                <FilterSelect
                    label="Campaign"
                    value={campaignUuid}
                    options={campaignOptions}
                    onChange={(value) =>
                        updateParams({ campaign_uuid: value || null, page: "1" })
                    }
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Spinner size="lg" />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-3 text-sm text-muted">
                        <span>
                            {total} send{total === 1 ? "" : "s"}
                            {isFetching ? " · Updating…" : ""}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                isDisabled={page <= 1}
                                onPress={() => updateParams({ page: String(page - 1) })}
                            >
                                Previous
                            </Button>
                            <span className="tabular-nums">
                                Page {page} of {Math.max(totalPages, 1)}
                            </span>
                            <Button
                                size="sm"
                                variant="secondary"
                                isDisabled={page >= totalPages}
                                onPress={() => updateParams({ page: String(page + 1) })}
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                    <SendHistoryTable rows={rows} />
                </>
            )}
        </div>
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { id: string; label: string }[];
    onChange: (value: string) => void;
}) {
    const selected = options.find((option) => option.id === value) ?? options[0];

    return (
        <Select
            className="w-44"
            aria-label={label}
            selectedKey={selected.id}
            onSelectionChange={(key) => onChange(String(key ?? ""))}
        >
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    {options.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                            {option.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
