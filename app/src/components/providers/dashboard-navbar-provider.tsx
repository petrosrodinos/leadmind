import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type FC,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface DashboardNavbarContextValue {
    title: string | null;
    setTitle: (title: string | null) => void;
    leadingEl: HTMLElement | null;
    trailingEl: HTMLElement | null;
    subnavEl: HTMLElement | null;
    setLeadingEl: (el: HTMLElement | null) => void;
    setTrailingEl: (el: HTMLElement | null) => void;
    setSubnavEl: (el: HTMLElement | null) => void;
}

const DashboardNavbarContext = createContext<DashboardNavbarContextValue | null>(null);

export const DashboardNavbarProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState<string | null>(null);
    const [leadingEl, setLeadingEl] = useState<HTMLElement | null>(null);
    const [trailingEl, setTrailingEl] = useState<HTMLElement | null>(null);
    const [subnavEl, setSubnavEl] = useState<HTMLElement | null>(null);

    const value = useMemo(
        () => ({
            title,
            setTitle,
            leadingEl,
            trailingEl,
            subnavEl,
            setLeadingEl,
            setTrailingEl,
            setSubnavEl,
        }),
        [title, leadingEl, trailingEl, subnavEl],
    );

    return (
        <DashboardNavbarContext.Provider value={value}>{children}</DashboardNavbarContext.Provider>
    );
};

function useDashboardNavbarContext() {
    const ctx = useContext(DashboardNavbarContext);
    if (!ctx) {
        throw new Error("Dashboard navbar hooks require DashboardNavbarProvider");
    }
    return ctx;
}

export function useDashboardNavbarSlots() {
    const { title, leadingEl, trailingEl, setLeadingEl, setTrailingEl, setSubnavEl } =
        useDashboardNavbarContext();
    return { title, leadingEl, trailingEl, setLeadingEl, setTrailingEl, setSubnavEl };
}

export function useDashboardNavbarTitle(title: string | null | undefined) {
    const { setTitle } = useDashboardNavbarContext();

    useEffect(() => {
        setTitle(title ?? null);
        return () => setTitle(null);
    }, [title, setTitle]);
}

export const DashboardNavbarLeading: FC<{ children: ReactNode }> = ({ children }) => {
    const { leadingEl } = useDashboardNavbarContext();
    if (!leadingEl) return null;
    return createPortal(children, leadingEl);
};

export const DashboardNavbarTrailing: FC<{ children: ReactNode }> = ({ children }) => {
    const { trailingEl } = useDashboardNavbarContext();
    if (!trailingEl) return null;
    return createPortal(children, trailingEl);
};

export const DashboardSubnav: FC<{ children: ReactNode }> = ({ children }) => {
    const { subnavEl } = useDashboardNavbarContext();
    if (!subnavEl) return null;
    return createPortal(children, subnavEl);
};
