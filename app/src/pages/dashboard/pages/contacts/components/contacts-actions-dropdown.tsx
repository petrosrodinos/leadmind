import type { FC } from "react";
import { Button, Dropdown } from "@heroui/react";
import { ChevronDown, ChevronsUpDown, Gauge, Globe, Mail, Plus, Sparkles } from "lucide-react";

interface ContactsActionsDropdownProps {
    onAddContact: () => void;
    onQuickBrowse?: () => void;
    quickBrowseDisabled?: boolean;
    onScoreSelected?: () => void;
    scoreDisabled?: boolean;
    onDraftMessagesSelected?: () => void;
    draftMessagesDisabled?: boolean;
    onEnrichSelected?: () => void;
    enrichDisabled?: boolean;
    onScrapeEmailsSelected?: () => void;
    scrapeEmailsDisabled?: boolean;
    scrapeEmailsPending?: boolean;
}

export const ContactsActionsDropdown: FC<ContactsActionsDropdownProps> = ({
    onAddContact,
    onQuickBrowse,
    quickBrowseDisabled = false,
    onScoreSelected,
    scoreDisabled = false,
    onDraftMessagesSelected,
    draftMessagesDisabled = false,
    onEnrichSelected,
    enrichDisabled = false,
    onScrapeEmailsSelected,
    scrapeEmailsDisabled = false,
    scrapeEmailsPending = false,
}) => (
    <Dropdown>
        <Dropdown.Trigger>
            <Button size="sm" variant="secondary">
                Actions
                <ChevronDown className="size-4" />
            </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover
            placement="bottom end"
            className="rounded-xl border border-border bg-surface p-1 shadow-xl outline-none backdrop-blur-none [backdrop-filter:none]"
        >
            <Dropdown.Menu
                className="min-w-[11rem] bg-transparent p-0 outline-none backdrop-blur-none [backdrop-filter:none]"
                onAction={(key) => {
                    if (key === "quick-browse") onQuickBrowse?.();
                    if (key === "score-selected") onScoreSelected?.();
                    if (key === "draft-messages-selected") onDraftMessagesSelected?.();
                    if (key === "enrich-selected") onEnrichSelected?.();
                    if (key === "scrape-emails-selected") onScrapeEmailsSelected?.();
                    if (key === "add-contact") onAddContact();
                }}
            >
                {onQuickBrowse ? (
                    <Dropdown.Item
                        id="quick-browse"
                        textValue="Quick browse"
                        isDisabled={quickBrowseDisabled}
                    >
                        <span className="flex items-center gap-2.5 antialiased">
                            <ChevronsUpDown className="size-4 shrink-0 text-muted" strokeWidth={2} />
                            <span className="font-medium text-foreground">Quick browse</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                {onScoreSelected ? (
                    <Dropdown.Item
                        id="score-selected"
                        textValue="Score selected"
                        isDisabled={scoreDisabled}
                    >
                        <span className="flex items-center gap-2.5 antialiased">
                            <Gauge className="size-4 shrink-0 text-muted" strokeWidth={2} />
                            <span className="font-medium text-foreground">Score selected</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                {onEnrichSelected ? (
                    <Dropdown.Item
                        id="enrich-selected"
                        textValue="Enrich selected"
                        isDisabled={enrichDisabled}
                    >
                        <span className="flex items-center gap-2.5 antialiased">
                            <Sparkles className="size-4 shrink-0 text-violet-500" strokeWidth={2} />
                            <span className="font-medium text-violet-400">Enrich selected</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                {onScrapeEmailsSelected ? (
                    <Dropdown.Item
                        id="scrape-emails-selected"
                        textValue="Find emails from websites"
                        isDisabled={scrapeEmailsDisabled || scrapeEmailsPending}
                    >
                        <span className="flex items-center gap-2.5 antialiased">
                            <Globe className="size-4 shrink-0 text-muted" strokeWidth={2} />
                            <span className="font-medium text-foreground">Find emails from websites</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                {onDraftMessagesSelected ? (
                    <Dropdown.Item
                        id="draft-messages-selected"
                        textValue="Draft messages for selected"
                        isDisabled={draftMessagesDisabled}
                    >
                        <span className="flex items-center gap-2.5 antialiased">
                            <Mail className="size-4 shrink-0 text-muted" strokeWidth={2} />
                            <span className="font-medium text-foreground">Draft messages for selected</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                <Dropdown.Item id="add-contact" textValue="Add contact">
                    <span className="flex items-center gap-2.5 antialiased">
                        <Plus className="size-4 shrink-0 text-accent" strokeWidth={2} />
                        <span className="font-medium text-foreground">Add contact</span>
                    </span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown>
);
