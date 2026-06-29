import type { FC } from "react";
import { Button, Dropdown } from "@heroui/react";
import { ChevronDown, ChevronsUpDown, Globe, Pencil, UserPlus } from "lucide-react";

interface ListActionsDropdownProps {
    showContactsActions?: boolean;
    onQuickBrowse?: () => void;
    quickBrowseDisabled?: boolean;
    onAddContacts?: () => void;
    onEditList: () => void;
    onScrapeEmails?: () => void;
    scrapeEmailsDisabled?: boolean;
    scrapeEmailsPending?: boolean;
}

export const ListActionsDropdown: FC<ListActionsDropdownProps> = ({
    showContactsActions = false,
    onQuickBrowse,
    quickBrowseDisabled = false,
    onAddContacts,
    onEditList,
    onScrapeEmails,
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
                    if (key === "add-contacts") onAddContacts?.();
                    if (key === "edit-list") onEditList();
                    if (key === "scrape-emails") onScrapeEmails?.();
                }}
            >
                {showContactsActions && onQuickBrowse ? (
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
                {showContactsActions && onAddContacts ? (
                    <Dropdown.Item id="add-contacts" textValue="Add contacts">
                        <span className="flex items-center gap-2.5 antialiased">
                            <UserPlus className="size-4 shrink-0 text-accent" strokeWidth={2} />
                            <span className="font-medium text-foreground">Add contacts</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                {showContactsActions && onScrapeEmails ? (
                    <Dropdown.Item
                        id="scrape-emails"
                        textValue="Find emails from websites"
                        isDisabled={scrapeEmailsDisabled || scrapeEmailsPending}
                    >
                        <span className="flex items-center gap-2.5 antialiased">
                            <Globe className="size-4 shrink-0 text-muted" strokeWidth={2} />
                            <span className="font-medium text-foreground">Find emails from websites</span>
                        </span>
                    </Dropdown.Item>
                ) : null}
                <Dropdown.Item id="edit-list" textValue="Edit list">
                    <span className="flex items-center gap-2.5 antialiased">
                        <Pencil className="size-4 shrink-0 text-muted" strokeWidth={2} />
                        <span className="font-medium text-foreground">Edit list</span>
                    </span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown>
);
