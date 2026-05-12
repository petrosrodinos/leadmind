import { useState } from "react";
import { Button, Popover } from "@heroui/react";
import { Braces, Check, Copy } from "lucide-react";
import { PLACEHOLDER_OPTIONS } from "@/lib/placeholder-render";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PlaceholderInsertPopoverProps {
  placement?: "bottom start" | "bottom end" | "top start" | "top end";
  triggerSize?: "sm" | "md" | "lg";
  triggerVariant?: "primary" | "secondary" | "tertiary";
  triggerLabel?: string;
}

export function PlaceholderInsertPopover({ placement = "bottom end", triggerSize = "sm", triggerVariant = "tertiary", triggerLabel = "Placeholders" }: PlaceholderInsertPopoverProps) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string) => {
    const token = `{{${key}}}`;
    try {
      await navigator.clipboard.writeText(token);
      setCopiedKey(key);
      toast({ title: `Copied ${token}`, variant: "success", duration: 1500 });
      window.setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1200);
    } catch {
      toast({ title: "Couldn't copy to clipboard", variant: "error" });
    }
  };

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button size={triggerSize} variant={triggerVariant} type="button">
          <Braces className="size-3.5" />
          {triggerLabel}
        </Button>
      </Popover.Trigger>
      <Popover.Content placement={placement} className={cn("w-[min(100vw-1.25rem,18rem)] p-0 overflow-hidden rounded-xl", "border border-border/90 bg-overlay/95 backdrop-blur-md", "shadow-[0_24px_48px_-12px_oklch(0_0_0/0.45),0_0_0_1px_oklch(1_0_0/0.04)_inset]")}>
        <Popover.Dialog className="outline-none">
          <div className="px-3 pt-2.5 pb-2 border-b border-border/60">
            <Popover.Heading className="text-sm font-semibold tracking-tight text-foreground leading-tight">Insert placeholder</Popover.Heading>
            <p className="text-[11px] text-muted leading-snug mt-0.5">Click to copy. Paste into the subject or message.</p>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {PLACEHOLDER_OPTIONS.map((opt) => {
              const isCopied = copiedKey === opt.key;
              return (
                <li key={opt.key}>
                  <button type="button" onClick={() => handleCopy(opt.key)} className={cn("w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors", "hover:bg-surface-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent", isCopied && "bg-accent/10")}>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground truncate">{opt.label}</span>
                        <code className="text-[10px] text-muted font-mono">{`{{${opt.key}}}`}</code>
                      </div>
                      <p className="text-[10px] text-muted mt-0.5 truncate">{opt.description}</p>
                    </div>
                    {isCopied ? <Check className="size-3.5 text-accent shrink-0" /> : <Copy className="size-3.5 text-muted shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
