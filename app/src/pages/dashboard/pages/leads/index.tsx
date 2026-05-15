import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { LeadsTable } from "./components/leads-table";
import { LeadFilters } from "./components/lead-filters";
import { CreateContactModal } from "./components/create-contact-modal";
import type { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { isLeadStatus } from "@/features/contacts/constants/contacts.constants";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Routes } from "@/routes/routes";
import { parseScoreRulesParam, serializeScoreRulesParam } from "@/lib/contact-score-rules";

const PAGE_SIZE = 20;

const isSourceType = (s: string | null): s is SourceType =>
    !!s && (Object.values(SourceType) as string[]).includes(s);

export default function LeadsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";
    const statusParam = searchParams.get("status");
    const sourceParam = searchParams.get("source_type");
    const filterUuid = searchParams.get("filter_uuid") || undefined;
    const scoreRulesParam = searchParams.get("score_rules");
    const scoreRules = useMemo(() => parseScoreRulesParam(scoreRulesParam), [scoreRulesParam]);
    const tags = (searchParams.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const status = isLeadStatus(statusParam) ? statusParam : undefined;
    const sourceType = isSourceType(sourceParam) ? sourceParam : undefined;

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);
    const navigate = useNavigate();

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const debouncedSearch = useDebouncedValue(search, 300);

    const query = useMemo(
        () => ({
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            status,
            source_type: sourceType,
            filter_uuid: filterUuid,
            score_rules: scoreRules.length > 0 ? scoreRules : undefined,
            tags: tags.length > 0 ? tags : undefined,
        }),
        [page, debouncedSearch, status, sourceType, filterUuid, scoreRulesParam, tags.join(",")],
    );

    const { data, isLoading, isFetching } = useContacts(query);

    const contacts = data?.data ?? [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground">Leads</h1>
                <Button onPress={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Add lead
                </Button>
            </div>

            <LeadFilters
                search={search}
                onSearchChange={(s) => updateParams({ search: s, page: "1" })}
                status={status}
                onStatusChange={(s) => updateParams({ status: s, page: "1" })}
                scoreRules={scoreRules}
                onScoreRulesChange={(next) => {
                    const enc = serializeScoreRulesParam(next);
                    updateParams({ score_rules: enc ?? undefined, page: "1" });
                }}
                sourceType={sourceType}
                onSourceTypeChange={(s) => updateParams({ source_type: s, page: "1" })}
                filterUuid={filterUuid}
                onFilterUuidChange={(u) => updateParams({ filter_uuid: u, page: "1" })}
                tags={tags}
                onTagsChange={(next) =>
                    updateParams({
                        tags: next.length > 0 ? next.join(",") : undefined,
                        page: "1",
                    })
                }
            />

            <LeadsTable
                contacts={contacts}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={data?.total ?? 0}
                totalPages={data?.totalPages ?? 1}
                onPageChange={(p) => updateParams({ page: String(p) })}
                onRowClick={(c) =>
                    navigate(Routes.dashboard.contacts_detail.replace(":uuid", c.uuid))
                }
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <CreateContactModal
                isOpen={createOpen}
                onOpenChange={setCreateOpen}
            />
        </div>
    );
}
