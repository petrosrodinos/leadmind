export interface ContactStackViewerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contactUuids: string[];
    activeUuid: string;
    currentIndex: number;
    onIndexChange: (index: number) => void;
    totalCount?: number;
    globalOffset?: number;
    onRequestNextPage?: () => void;
    onRequestPrevPage?: () => void;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}

export interface ContactStackNavigationState {
    canGoPrev: boolean;
    canGoNext: boolean;
    globalPosition: number;
    totalCount: number;
}
