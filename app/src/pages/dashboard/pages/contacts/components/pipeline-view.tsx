import { useMemo } from "react";
import { Chip } from "@heroui/react";
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DropResult,
} from "@hello-pangea/dnd";
import { LeadStatus, type Contact } from "@/features/contacts/interfaces/contact.interface";
import {
    emptyContactsByStatus,
    isLeadStatus,
    PIPELINE_STATUS_OPTIONS,
} from "@/features/contacts/constants/contacts.constants";
import { useUpdateContactStatus } from "@/features/contacts/hooks/use-contacts";
import { ContactScoresCompact } from "@/pages/dashboard/pages/leads/components/badges";
import { cn } from "@/lib/utils";

interface PipelineViewProps {
    contacts: Contact[];
    isLoading: boolean;
    onCardClick: (contact: Contact) => void;
}

const PIPELINE_GRID_CLASS = "grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

export function PipelineView({ contacts, isLoading, onCardClick }: PipelineViewProps) {
    const updateStatus = useUpdateContactStatus();

    const grouped = useMemo(() => {
        const map = emptyContactsByStatus<Contact>();
        for (const c of contacts) {
            (map[c.status] ?? map[LeadStatus.NEW]).push(c);
        }
        return map;
    }, [contacts]);

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;
        const nextStatus = destination.droppableId;
        if (!isLeadStatus(nextStatus)) return;
        updateStatus.mutate({ uuid: draggableId, status: nextStatus });
    };

    if (isLoading) {
        return (
            <div className={PIPELINE_GRID_CLASS}>
                {PIPELINE_STATUS_OPTIONS.map((col) => (
                    <div
                        key={col.id}
                        className="rounded-xl border border-border bg-surface p-3 min-h-72"
                    >
                        <div className="h-4 w-24 rounded bg-surface-secondary animate-pulse mb-3" />
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 rounded-lg bg-surface-secondary animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className={PIPELINE_GRID_CLASS}>
                {PIPELINE_STATUS_OPTIONS.map((col) => {
                    const items = grouped[col.id] ?? [];
                    return (
                        <div
                            key={col.id}
                            className="rounded-xl border border-border bg-surface flex flex-col min-h-72"
                        >
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                        {col.label}
                                    </span>
                                    <Chip size="sm" variant="soft">
                                        <Chip.Label>{items.length}</Chip.Label>
                                    </Chip>
                                </div>
                            </div>
                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                            "flex-1 p-2 space-y-2 transition-colors",
                                            col.pipelineTone,
                                            snapshot.isDraggingOver && "bg-accent/10",
                                        )}
                                    >
                                        {items.length === 0 && (
                                            <p className="text-xs text-muted italic px-1 py-2">
                                                Drop contacts here
                                            </p>
                                        )}
                                        {items.map((contact, idx) => (
                                            <Draggable
                                                key={contact.uuid}
                                                draggableId={contact.uuid}
                                                index={idx}
                                            >
                                                {(dragProvided, dragSnapshot) => (
                                                    <div
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        {...dragProvided.dragHandleProps}
                                                        onClick={(e) => {
                                                            if (dragSnapshot.isDragging) return;
                                                            if ((e.target as HTMLElement).closest("button")) return;
                                                            onCardClick(contact);
                                                        }}
                                                        className={cn(
                                                            "rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-accent/50 transition-colors",
                                                            dragSnapshot.isDragging &&
                                                                "shadow-lg ring-2 ring-accent",
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {contact.name ?? "Unnamed"}
                                                                </p>
                                                                {contact.company && (
                                                                    <p className="text-xs text-muted truncate">
                                                                        {contact.company}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ContactScoresCompact contact={contact} />
                                                        </div>
                                                        {contact.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {contact.tags.slice(0, 3).map((t) => (
                                                                    <Chip
                                                                        key={t}
                                                                        size="sm"
                                                                        variant="soft"
                                                                    >
                                                                        <Chip.Label>{t}</Chip.Label>
                                                                    </Chip>
                                                                ))}
                                                                {contact.tags.length > 3 && (
                                                                    <span className="text-[10px] text-muted self-center">
                                                                        +{contact.tags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
