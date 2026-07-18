import type { FC, ReactNode } from "react";
import { ContactStackViewerModal } from "./contact-stack-viewer-modal";
import { useContactStackViewer } from "@/pages/dashboard/hooks/use-contact-stack-viewer";

export interface ContactStackViewerControls {
    openAt: (contactUuid: string) => void;
    openFirst: () => void;
    hasContacts: boolean;
}

interface ContactStackViewerScopeProps {
    contactUuids: string[];
    page: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    children: (controls: ContactStackViewerControls) => ReactNode;
}

export const ContactStackViewerScope: FC<ContactStackViewerScopeProps> = ({
    contactUuids,
    page,
    totalPages,
    pageSize,
    totalCount,
    onPageChange,
    children,
}) => {
    const stackViewer = useContactStackViewer({
        contactUuids,
        page,
        totalPages,
        pageSize,
        onPageChange,
    });

    const controls: ContactStackViewerControls = {
        openAt: stackViewer.openAt,
        openFirst: () => {
            const firstUuid = contactUuids[0];
            if (firstUuid) stackViewer.openAt(firstUuid);
        },
        hasContacts: contactUuids.length > 0,
    };

    return (
        <>
            {children(controls)}
            <ContactStackViewerModal
                isOpen={stackViewer.isOpen}
                onOpenChange={stackViewer.setIsOpen}
                contactUuids={contactUuids}
                activeUuid={stackViewer.activeUuid}
                currentIndex={stackViewer.currentIndex}
                onIndexChange={stackViewer.setCurrentIndex}
                totalCount={totalCount}
                globalOffset={stackViewer.globalOffset}
                onRequestNextPage={stackViewer.handleRequestNextPage}
                onRequestPrevPage={stackViewer.handleRequestPrevPage}
                hasNextPage={stackViewer.hasNextPage}
                hasPrevPage={stackViewer.hasPrevPage}
            />
        </>
    );
};
