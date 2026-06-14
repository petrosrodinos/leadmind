import { useCallback, useEffect, useState } from "react";

interface UseContactStackViewerOptions {
    contactUuids: string[];
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
}

export function useContactStackViewer({
    contactUuids,
    page,
    totalPages,
    onPageChange,
    pageSize,
}: UseContactStackViewerOptions) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pendingPageNav, setPendingPageNav] = useState<"next" | "prev" | null>(null);

    const openAt = useCallback(
        (contactUuid: string) => {
            const index = contactUuids.findIndex((id) => id === contactUuid);
            setCurrentIndex(index >= 0 ? index : 0);
            setIsOpen(true);
        },
        [contactUuids],
    );

    const close = useCallback(() => {
        setIsOpen(false);
        setPendingPageNav(null);
    }, []);

    const handleRequestNextPage = useCallback(() => {
        if (page >= totalPages) return;
        setPendingPageNav("next");
        onPageChange(page + 1);
    }, [onPageChange, page, totalPages]);

    const handleRequestPrevPage = useCallback(() => {
        if (page <= 1) return;
        setPendingPageNav("prev");
        onPageChange(page - 1);
    }, [onPageChange, page]);

    useEffect(() => {
        if (!pendingPageNav || contactUuids.length === 0) return;

        if (pendingPageNav === "next") {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(contactUuids.length - 1);
        }
        setPendingPageNav(null);
    }, [contactUuids, pendingPageNav]);

    return {
        isOpen,
        setIsOpen,
        currentIndex,
        setCurrentIndex,
        openAt,
        close,
        globalOffset: (page - 1) * pageSize,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        handleRequestNextPage,
        handleRequestPrevPage,
    };
}
