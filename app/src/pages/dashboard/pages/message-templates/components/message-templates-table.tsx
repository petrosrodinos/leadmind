import { Chip } from "@heroui/react";
import { Mail, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Button } from "@heroui/react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";

function formatTemplateDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface MessageTemplatesTableProps {
    templates: MessageTemplate[];
    onEdit: (template: MessageTemplate) => void;
    onDelete: (template: MessageTemplate) => void;
}

function previewText(template: MessageTemplate): string {
    if (template.channels.includes(Channel.EMAIL) && template.email_content) {
        const stripped = template.email_content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return template.email_subject?.trim() || stripped.slice(0, 120) || "Email template";
    }
    if (template.channels.includes(Channel.SMS) && template.sms_content) {
        return template.sms_content.trim().slice(0, 120);
    }
    return "Empty template";
}

export function MessageTemplatesTable({ templates, onEdit, onDelete }: MessageTemplatesTableProps) {
    if (templates.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-surface-secondary/30 p-10 text-center text-sm text-muted">
                No templates yet. Create one from scratch or import from a campaign.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
                <thead className="bg-surface-secondary/40 text-muted">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Channels</th>
                        <th className="px-4 py-3 text-left font-medium">Preview</th>
                        <th className="px-4 py-3 text-left font-medium">Updated</th>
                        <th className="px-4 py-3 text-right font-medium w-28">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {templates.map((template) => (
                        <tr key={template.uuid} className="border-t border-border hover:bg-surface-secondary/30">
                            <td className="px-4 py-3 align-top font-medium text-foreground">{template.name}</td>
                            <td className="px-4 py-3 align-top">
                                <div className="flex flex-wrap gap-1">
                                    {template.channels.includes(Channel.EMAIL) ? (
                                        <Chip size="sm" variant="soft">
                                            <Mail className="size-3" />
                                            <Chip.Label>Email</Chip.Label>
                                        </Chip>
                                    ) : null}
                                    {template.channels.includes(Channel.SMS) ? (
                                        <Chip size="sm" variant="soft">
                                            <MessageSquare className="size-3" />
                                            <Chip.Label>SMS</Chip.Label>
                                        </Chip>
                                    ) : null}
                                </div>
                            </td>
                            <td className="px-4 py-3 align-top max-w-md text-muted line-clamp-2">
                                {previewText(template)}
                            </td>
                            <td className="px-4 py-3 align-top text-muted whitespace-nowrap">
                                {formatTemplateDate(template.updated_at)}
                            </td>
                            <td className="px-4 py-3 align-top">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        size="sm"
                                        variant="tertiary"
                                        onPress={() => onEdit(template)}
                                        aria-label="Edit template"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="tertiary"
                                        onPress={() => onDelete(template)}
                                        aria-label="Delete template"
                                    >
                                        <Trash2 className="size-4 text-danger" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
