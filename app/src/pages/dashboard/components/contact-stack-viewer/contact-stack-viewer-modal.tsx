import { useEffect, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@heroui/react";
import { cn } from "@/lib/utils";
import { ContactDetailView } from "@/pages/dashboard/pages/contacts/pages/detail/components";
import { contactsQueryKeys } from "@/features/contacts/hooks/use-contacts";
import { getContact } from "@/features/contacts/services/contacts.service";
import { ContactStackViewerToolbar } from "./contact-stack-viewer-toolbar";
import { useContactStackNavigation } from "./use-contact-stack-navigation";
import type { ContactStackViewerProps } from "./types";

export const ContactStackViewerModal: FC<ContactStackViewerProps> = ({
    isOpen,
    onOpenChange,
    contactUuids,
    currentIndex,
    onIndexChange,
    totalCount,
    globalOffset = 0,
    onRequestNextPage,
    onRequestPrevPage,
    hasNextPage = false,
    hasPrevPage = false,
}) => {
    const queryClient = useQueryClient();
    const activeUuid = contactUuids[currentIndex] ?? "";

    const { navigation, goPrev, goNext } = useContactStackNavigation({
        contactUuids,
        currentIndex,
        onIndexChange,
        totalCount,
        globalOffset,
        onRequestNextPage,
        onRequestPrevPage,
        hasNextPage,
        hasPrevPage,
    });

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                goPrev();
            } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                goNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goNext, goPrev, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const prefetchUuid = contactUuids[currentIndex + 1] ?? contactUuids[currentIndex - 1];
        if (!prefetchUuid) return;

        void queryClient.prefetchQuery({
            queryKey: contactsQueryKeys.detail(prefetchUuid),
            queryFn: () => getContact(prefetchUuid),
        });
    }, [contactUuids, currentIndex, isOpen, queryClient]);

    const handleClose = () => onOpenChange(false);

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            <Modal.Container scroll="inside" className="!p-0 !items-stretch !justify-stretch">
                <Modal.Dialog
                    className={cn(
                        "!m-0 !max-w-none !w-full !h-[100dvh] !rounded-none",
                        "flex flex-col bg-background overflow-hidden",
                    )}
                >
                    {activeUuid ? (
                        <ContactStackViewerToolbar
                            contactUuid={activeUuid}
                            navigation={navigation}
                            onClose={handleClose}
                            onPrev={goPrev}
                            onNext={goNext}
                        />
                    ) : null}

                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6">
                        {activeUuid ? (
                            <ContactDetailView key={activeUuid} contactUuid={activeUuid} showDelete={false} />
                        ) : (
                            <div className="flex h-full min-h-[40vh] items-center justify-center text-sm text-muted">
                                No contacts to display.
                            </div>
                        )}
                    </div>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
