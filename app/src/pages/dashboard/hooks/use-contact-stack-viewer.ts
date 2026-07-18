import { useCallback, useEffect, useMemo, useState } from "react";

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
    const [activeUuid, setActiveUuid] = useState<string | null>(null);
    const [pendingPageNav, setPendingPageNav] = useState<"next" | "prev" | null>(null);

    const currentIndex = useMemo(() => {
        if (!activeUuid) return 0;
        const index = contactUuids.findIndex((id) => id === activeUuid);
        return index >= 0 ? index : 0;
    }, [activeUuid, contactUuids]);

    const setCurrentIndex = useCallback(
        (index: number) => {
            const uuid = contactUuids[index];
            if (uuid) setActiveUuid(uuid);
        },
        [contactUuids],
    );

    const openAt = useCallback((contactUuid: string) => {
        setActiveUuid(contactUuid);
        setIsOpen(true);
    }, []);

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
            setActiveUuid(contactUuids[0] ?? null);
        } else {
            setActiveUuid(contactUuids[contactUuids.length - 1] ?? null);
        }
        setPendingPageNav(null);
    }, [contactUuids, pendingPageNav]);

    return {
        isOpen,
        setIsOpen,
        activeUuid: activeUuid ?? "",
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
