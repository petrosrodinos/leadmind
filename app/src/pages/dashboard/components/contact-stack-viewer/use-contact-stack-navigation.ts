import { useCallback, useMemo } from "react";
import type { ContactStackNavigationState } from "./types";

interface UseContactStackNavigationOptions {
    contactUuids: string[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    totalCount?: number;
    globalOffset?: number;
    onRequestNextPage?: () => void;
    onRequestPrevPage?: () => void;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}

export function useContactStackNavigation({
    contactUuids,
    currentIndex,
    onIndexChange,
    totalCount,
    globalOffset = 0,
    onRequestNextPage,
    onRequestPrevPage,
    hasNextPage = false,
    hasPrevPage = false,
}: UseContactStackNavigationOptions) {
    const resolvedTotal = totalCount ?? contactUuids.length;
    const globalPosition = globalOffset + currentIndex + 1;

    const canGoPrev = currentIndex > 0 || (hasPrevPage && Boolean(onRequestPrevPage));
    const canGoNext =
        currentIndex < contactUuids.length - 1 || (hasNextPage && Boolean(onRequestNextPage));

    const navigation: ContactStackNavigationState = useMemo(
        () => ({
            canGoPrev,
            canGoNext,
            globalPosition,
            totalCount: resolvedTotal,
        }),
        [canGoPrev, canGoNext, globalPosition, resolvedTotal],
    );

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
            return;
        }
        if (hasPrevPage && onRequestPrevPage) {
            onRequestPrevPage();
        }
    }, [currentIndex, hasPrevPage, onIndexChange, onRequestPrevPage]);

    const goNext = useCallback(() => {
        if (currentIndex < contactUuids.length - 1) {
            onIndexChange(currentIndex + 1);
            return;
        }
        if (hasNextPage && onRequestNextPage) {
            onRequestNextPage();
        }
    }, [contactUuids.length, currentIndex, hasNextPage, onIndexChange, onRequestNextPage]);

    return {
        navigation,
        goPrev,
        goNext,
    };
}
