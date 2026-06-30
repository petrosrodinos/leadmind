import { ListBox, Select } from "@heroui/react";

export function UsageFilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { key: string; label: string }[];
    onChange: (key: string) => void;
}) {
    return (
        <Select
            aria-label={label}
            placeholder={label}
            value={value || null}
            onChange={(v) => onChange(v != null ? String(v) : "")}
        >
            <Select.Trigger className="min-w-36 h-8 text-xs">
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    <ListBox.Item key="" id="" textValue={label}>
                        {label}
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                    {options.map((o) => (
                        <ListBox.Item key={o.key} id={o.key} textValue={o.label}>
                            {o.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
