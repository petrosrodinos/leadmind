import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem("theme") as Theme;
        return stored || "system";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const getSystemTheme = () =>
            window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

        const applyTheme = (currentTheme: Theme) => {
            root.classList.remove("light", "dark");

            if (currentTheme === "system") {
                root.classList.add(getSystemTheme());
            } else {
                root.classList.add(currentTheme);
            }
        };

        applyTheme(theme);
        localStorage.setItem("theme", theme);

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme(theme);
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    const getSystemTheme = () =>
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    const getThemeLabel = () => {
        const currentTheme = theme === "system" ? getSystemTheme() : theme;
        return currentTheme === "dark" ? "Light" : "Dark";
    };

    const getThemeIconType = () => {
        const currentTheme = theme === "system" ? getSystemTheme() : theme;
        return currentTheme === "dark" ? "sun" : "moon";
    };

    return {
        theme,
        setTheme,
        toggleTheme: () => {
            setTheme(prev => prev === "dark" ? "light" : "dark");
        },
        getThemeLabel,
        getThemeIconType
    };
};
