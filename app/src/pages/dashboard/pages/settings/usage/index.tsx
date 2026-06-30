import { useSearchParams } from "react-router-dom";
import { Tabs } from "@heroui/react";
import { BarChart2, Bot, Globe } from "lucide-react";
import { AiUsagePanel } from "./components/ai-usage-panel";
import { ApifyUsagePanel } from "./components/apify-usage-panel";
import {
    USAGE_TAB_CLASS,
    USAGE_TAB_PARAM,
    USAGE_TABS,
    type UsageTabId,
} from "./constants/usage-tabs.constants";

function parseTab(value: string | null): UsageTabId {
    return value === "apify" ? "apify" : "ai";
}

export default function SettingsUsagePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = parseTab(searchParams.get(USAGE_TAB_PARAM));

    const setTab = (tab: UsageTabId) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (tab === "ai") next.delete(USAGE_TAB_PARAM);
                else next.set(USAGE_TAB_PARAM, tab);
                return next;
            },
            { replace: true },
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                    <BarChart2 className="size-5 text-muted shrink-0" />
                    <div>
                        <h1 className="text-lg font-semibold text-foreground leading-tight">Usage</h1>
                        <p className="text-xs text-muted mt-0.5">
                            AI and Apify consumption for your account
                        </p>
                    </div>
                </div>

                <Tabs selectedKey={activeTab} onSelectionChange={(key) => setTab(String(key) as UsageTabId)}>
                    <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border">
                        {USAGE_TABS.map((tab) => (
                            <Tabs.Tab key={tab.id} id={tab.id} className={USAGE_TAB_CLASS}>
                                {tab.id === "ai" ? (
                                    <Bot className="size-3.5" />
                                ) : (
                                    <Globe className="size-3.5" />
                                )}
                                {tab.label}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs>
            </div>

            {activeTab === "ai" ? <AiUsagePanel /> : <ApifyUsagePanel />}
        </div>
    );
}
