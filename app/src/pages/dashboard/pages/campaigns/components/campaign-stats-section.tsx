import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { cn } from "@/lib/utils";
import { StatsCards } from "./stats-cards";
import { CampaignAnalytics } from "./campaign-analytics";

export function CampaignStatsSection({ campaign }: { campaign: MarketingCampaign }) {
    const [open, setOpen] = useState(false);

    return (
        <section className="space-y-3">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={open}
            >
                <h2 className="text-sm font-semibold text-foreground">Campaign stats</h2>
                <ChevronDown
                    className={cn(
                        "size-4 shrink-0 text-muted transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>
            {open ? (
                <div className="space-y-5">
                    <StatsCards campaign={campaign} />
                    <CampaignAnalytics campaign={campaign} embedded />
                </div>
            ) : null}
        </section>
    );
}
