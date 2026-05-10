import { useRef, useState } from "react";
import { Button, Chip, Input } from "@heroui/react";
import { Check, Plus, X } from "lucide-react";

interface TagEditorProps {
  tags: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function TagEditor({ tags, onChange, disabled }: TagEditorProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const commitAdd = () => {
    const t = draft.trim();
    setAdding(false);
    setDraft("");
    if (!t) return;
    if (tags.includes(t)) return;
    onChange([...tags, t]);
  };

  const cancelAdd = () => {
    setAdding(false);
    setDraft("");
  };

  const remove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const beginEdit = (idx: number, current: string) => {
    setEditingIdx(idx);
    setEditingValue(current);
    setTimeout(() => editInputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (editingIdx === null) return;
    const next = editingValue.trim();
    const prev = tags[editingIdx]!;
    if (!next || next === prev) {
      setEditingIdx(null);
      setEditingValue("");
      return;
    }
    if (tags.includes(next)) {
      onChange(tags.filter((_, i) => i !== editingIdx));
    } else {
      onChange(tags.map((t, i) => (i === editingIdx ? next : t)));
    }
    setEditingIdx(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditingValue("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag, idx) =>
        editingIdx === idx ? (
          <span key={`edit-${idx}`} className="inline-flex items-center gap-1 rounded-md bg-surface-secondary border border-border px-2 py-0.5">
            <Input
              ref={editInputRef}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              onBlur={commitEdit}
              className="h-6 px-1 text-xs w-24 bg-transparent border-0 shadow-none focus-visible:ring-0"
              aria-label="Edit tag"
            />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={commitEdit} className="text-muted hover:text-success" aria-label="Save tag">
              <Check className="size-3" />
            </button>
          </span>
        ) : (
          <Chip key={tag} size="sm" variant="soft">
            <button type="button" disabled={disabled} onClick={() => beginEdit(idx, tag)} className="cursor-text disabled:cursor-not-allowed" aria-label={`Edit tag ${tag}`}>
              <Chip.Label>{tag}</Chip.Label>
            </button>
            <button type="button" disabled={disabled} onClick={() => remove(tag)} className="ml-1 text-muted hover:text-danger disabled:opacity-50" aria-label={`Remove tag ${tag}`}>
              <X className="size-3" />
            </button>
          </Chip>
        ),
      )}

      {adding ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary border border-border px-2 py-0.5">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitAdd();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelAdd();
              }
            }}
            onBlur={commitAdd}
            placeholder="tag name"
            className="h-6 px-1 text-xs w-28 bg-transparent border-0 shadow-none focus-visible:ring-0"
            aria-label="New tag"
          />
        </span>
      ) : (
        <Button
          size="sm"
          variant="tertiary"
          isDisabled={disabled}
          onPress={() => {
            setAdding(true);
            setDraft("");
          }}
          aria-label="Add tag"
        >
          <Plus className="size-3.5" />
          Add tag
        </Button>
      )}

      {tags.length === 0 && !adding && <span className="text-xs text-muted italic">Click on a tag to edit, X to remove.</span>}
    </div>
  );
}
