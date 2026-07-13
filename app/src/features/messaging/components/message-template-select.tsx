import { useMemo, useState } from "react";
import type { Key } from "@react-types/shared";
import { Label, ListBox, Select } from "@heroui/react";
import { FileText } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { useMessageTemplates } from "@/features/message-templates/hooks/use-message-templates";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";
import { filterTemplatesForChannels } from "@/features/message-templates/utils/message-template-composer.utils";

interface MessageTemplateSelectProps {
    allowedChannels: Channel[];
    disabled?: boolean;
    onSelect: (template: MessageTemplate) => void;
}

export function MessageTemplateSelect({
    allowedChannels,
    disabled = false,
    onSelect,
}: MessageTemplateSelectProps) {
    const { data: templates = [], isLoading } = useMessageTemplates();
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

    const options = useMemo(
        () => filterTemplatesForChannels(templates, allowedChannels),
        [templates, allowedChannels],
    );

    const placeholder = isLoading
        ? "Loading templates…"
        : options.length === 0
          ? "No templates available"
          : "Choose a template";

    const handleChange = (value: Key | null) => {
        if (!value || typeof value !== "string") return;
        const template = options.find((item) => item.uuid === value);
        if (!template) return;
        setSelectedUuid(value);
        onSelect(template);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-muted" />
                Use template
            </Label>
            <Select
                aria-label="Message template"
                placeholder={placeholder}
                value={selectedUuid ?? undefined}
                onChange={handleChange}
                isDisabled={disabled || isLoading || options.length === 0}
            >
                <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {options.map((template) => (
                            <ListBox.Item
                                key={template.uuid}
                                id={template.uuid}
                                textValue={template.name}
                            >
                                {template.name}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
        </div>
    );
}
