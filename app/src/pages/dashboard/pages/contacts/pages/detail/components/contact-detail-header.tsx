import { Button } from "@heroui/react";
import { ArrowLeft, Trash } from "lucide-react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { ContactScoresCompact, StatusChip } from "@/pages/dashboard/pages/leads/components/badges";

interface ContactDetailHeaderProps {
  isLoading: boolean;
  contact: Contact | undefined;
  onBack?: () => void;
  onDeletePress: () => void;
  deletePending: boolean;
  showBack?: boolean;
  showDelete?: boolean;
}

export function ContactDetailHeader({
  isLoading,
  contact,
  onBack,
  onDeletePress,
  deletePending,
  showBack = true,
  showDelete = true,
}: ContactDetailHeaderProps) {
  return (
    <div className="flex items-start gap-3 min-w-0 flex-wrap">
      {showBack && onBack ? (
        <Button size="sm" variant="tertiary" onPress={onBack} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
      ) : null}
      <div className="min-w-0 flex-1">
        {isLoading ? (
          <>
            <div className="h-7 w-48 max-w-full rounded-md bg-surface-secondary animate-pulse" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-5 w-16 rounded-md bg-surface-secondary animate-pulse" />
              <div className="h-5 w-12 rounded-md bg-surface-secondary animate-pulse" />
              <div className="h-5 w-32 rounded-md bg-surface-secondary animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground truncate">{contact?.name ?? "Contact not found"}</h1>
            {contact && (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <StatusChip status={contact.status} />
                <ContactScoresCompact contact={contact} />
                {contact.company && <span className="text-sm text-muted truncate">{contact.company}</span>}
              </div>
            )}
          </>
        )}
      </div>

      {contact && showDelete ? (
        <Button variant="tertiary" className="text-danger" isDisabled={deletePending} onPress={onDeletePress} aria-label="Delete contact">
          <Trash className="size-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      ) : null}
    </div>
  );
}
