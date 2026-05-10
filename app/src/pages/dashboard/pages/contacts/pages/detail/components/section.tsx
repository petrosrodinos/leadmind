import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  emptyText?: string;
}

function hasEmptyChildArray(children: ReactNode): boolean {
  if (children === null || typeof children !== "object") return false;
  const props = (children as { props?: { children?: unknown } }).props;
  const inner = props?.children;
  return Array.isArray(inner) && inner.length === 0;
}

export function Section({ title, action, children, emptyText }: SectionProps) {
  const empty = hasEmptyChildArray(children);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {empty && emptyText ? <p className="text-sm text-muted italic">{emptyText}</p> : children}
    </section>
  );
}
