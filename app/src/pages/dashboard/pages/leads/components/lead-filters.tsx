import { Input, Label, ListBox, Select, Slider } from "@heroui/react";
import { Search } from "lucide-react";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import type { SourceType } from "@/features/leads/interfaces/lead.interface";
import { SOURCE_OPTIONS } from "@/features/leads/constants/source-options";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { useContactTags } from "@/features/contacts/hooks/use-contacts";
import { MultiSelect } from "@/components/ui/multi-select";
import { STATUS_OPTIONS } from "@/features/contacts/constants/contacts.constants";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (s: string) => void;
  status: LeadStatus | undefined;
  onStatusChange: (s: LeadStatus | undefined) => void;
  minScore: number;
  onMinScoreChange: (n: number) => void;
  sourceType: SourceType | undefined;
  onSourceTypeChange: (s: SourceType | undefined) => void;
  filterUuid: string | undefined;
  onFilterUuidChange: (uuid: string | undefined) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function LeadFilters({ search, onSearchChange, status, onStatusChange, minScore, onMinScoreChange, sourceType, onSourceTypeChange, filterUuid, onFilterUuidChange, tags, onTagsChange }: LeadFiltersProps) {
  const { data: filters = [] } = useFilters();
  const { data: availableTags = [] } = useContactTags();

  return (
    <div className="bg-surface rounded-xl border border-border p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <Label htmlFor="contacts-search" className="mb-1 block">
          Search
        </Label>
        <div className="relative">
          <Search className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input id="contacts-search" placeholder="Name, company, email…" className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} fullWidth />
        </div>
      </div>

      <div>
        <Select className="w-full" placeholder="All statuses" value={status ?? null} onChange={(v) => onStatusChange((v as LeadStatus) || undefined)}>
          <Label>Status</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="" textValue="All statuses">
                All statuses
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {STATUS_OPTIONS.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                  {opt.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div>
        <Select className="w-full" placeholder="All sources" value={sourceType ?? null} onChange={(v) => onSourceTypeChange((v as SourceType) || undefined)}>
          <Label>Source</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="" textValue="All sources">
                All sources
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {SOURCE_OPTIONS.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                  {opt.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div>
        <Select className="w-full" placeholder="All filters" value={filterUuid ?? null} onChange={(v) => onFilterUuidChange((v as string) || undefined)}>
          <Label>Filter</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="" textValue="All filters">
                All filters
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {filters.map((f) => (
                <ListBox.Item key={f.uuid} id={f.uuid} textValue={f.name}>
                  {f.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="lg:col-span-1">
        <Slider className="w-full" minValue={1} maxValue={10} step={1} value={minScore} onChange={(v) => onMinScoreChange(Array.isArray(v) ? v[0] : v)}>
          <Label>Min score</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </div>

      <div className="lg:col-span-6">
        <Label className="mb-1 block">Tags</Label>
        <MultiSelect options={availableTags} value={tags} onChange={onTagsChange} placeholder="All tags" aria-label="Filter by tags" />
      </div>
    </div>
  );
}
