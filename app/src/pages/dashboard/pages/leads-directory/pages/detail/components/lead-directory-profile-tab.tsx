import type { ComponentType, ReactNode } from "react";
import type { Lead } from "@/features/leads/interfaces/lead.interface";
import { SourceBadge } from "@/components/ui/source-badge";
import { AtSign, Briefcase, Building2, CalendarClock, ExternalLink, Globe, MapPin, Sparkles, Tag } from "lucide-react";

function initialsFromName(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0];
  const b = parts[parts.length - 1][0];
  return `${a}${b}`.toUpperCase();
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function ProfileValue({ value, href, emptyLabel = "—" }: { value: string | null | undefined; href?: string; emptyLabel?: string }) {
  if (!value?.trim()) {
    return (
      <p className="text-sm text-muted/70 tabular-nums" aria-label="Empty">
        {emptyLabel}
      </p>
    );
  }
  const text = value.trim();
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-link hover:underline break-all">
        {text}
      </a>
    );
  }
  return <p className="text-sm font-medium text-foreground whitespace-pre-line break-words">{text}</p>;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string; strokeWidth?: number }>; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-sm shadow-[0_1px_0_oklch(1_0_0/0.04)_inset] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 bg-surface-secondary/40">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,8.5rem)_1fr] sm:gap-4 sm:items-start">
      <p className="text-xs font-medium text-muted pt-0.5">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function LeadDirectoryProfileTab({ lead }: { lead: Lead }) {
  const summaryPreview = lead.enrichment_summary?.trim();
  const websiteHref = lead.website?.trim() ? normalizeUrl(lead.website.trim()) : undefined;
  const linkedinHref = lead.linkedin_url?.trim() || undefined;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-accent/[0.07] via-surface to-surface-secondary/30 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-link/5 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent/25 to-accent/5 text-xl font-semibold tracking-tight text-accent-foreground ring-2 ring-accent/25 ring-offset-2 ring-offset-[var(--surface)] shadow-lg" aria-hidden>
              {initialsFromName(lead.name)}
            </div>
            <div className="min-w-0 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground truncate">{lead.name?.trim() || "Unnamed lead"}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {lead.title?.trim() ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
                    <Briefcase className="size-3.5 text-muted" strokeWidth={2} />
                    {lead.title.trim()}
                  </span>
                ) : null}
                {lead.company?.trim() ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
                    <Building2 className="size-3.5 text-muted" strokeWidth={2} />
                    {lead.company.trim()}
                  </span>
                ) : null}
                <SourceBadge source={lead.source_type} className="shrink-0" />
              </div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
                  Added {formatShortDate(lead.created_at)}
                </span>
                <span className="hidden sm:inline text-border">·</span>
                <span className="inline-flex items-center gap-1.5">Updated {formatShortDate(lead.updated_at)}</span>
              </p>
            </div>
          </div>
          {(websiteHref || linkedinHref) && (
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {websiteHref ? (
                <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface-secondary/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-accent/40 hover:bg-surface-tertiary/80">
                  <Globe className="size-4 text-accent" strokeWidth={2} />
                  Website
                </a>
              ) : null}
              {linkedinHref ? (
                <a href={linkedinHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface-secondary/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-accent/40 hover:bg-surface-tertiary/80">
                  <ExternalLink className="size-4 text-accent" strokeWidth={2} />
                  LinkedIn
                </a>
              ) : null}
            </div>
          )}
        </div>
        {summaryPreview ? (
          <div className="relative mt-6 rounded-xl border border-accent/20 bg-accent/[0.06] px-4 py-3 sm:px-5">
            <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              <Sparkles className="size-3.5" strokeWidth={2} />
              Enrichment snapshot
            </p>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words line-clamp-4">{summaryPreview}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Contact" icon={AtSign}>
          <Row label="Email">
            <ProfileValue value={lead.email} href={lead.email?.trim() ? `mailto:${lead.email.trim()}` : undefined} />
          </Row>
          <Row label="Phone">
            <ProfileValue value={lead.phone} href={lead.phone?.trim() ? `tel:${lead.phone.trim()}` : undefined} />
          </Row>
        </SectionCard>

        <SectionCard title="Professional" icon={Briefcase}>
          <Row label="Title">
            <ProfileValue value={lead.title} />
          </Row>
          <Row label="Company">
            <ProfileValue value={lead.company} />
          </Row>
          <Row label="Industry">
            <ProfileValue value={lead.industry} />
          </Row>
          <Row label="Location">
            <div className="flex items-start gap-2 min-w-0">
              {lead.location?.trim() ? <MapPin className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden /> : null}
              <div className="min-w-0 flex-1">
                <ProfileValue value={lead.location} />
              </div>
            </div>
          </Row>
        </SectionCard>

        <SectionCard title="Links & presence" icon={Globe}>
          <Row label="Website">
            <div className="flex items-start gap-2">
              {websiteHref ? <Globe className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden /> : null}
              <ProfileValue value={lead.website} href={websiteHref} />
            </div>
          </Row>
          <Row label="LinkedIn">
            <div className="flex items-start gap-2">
              {linkedinHref ? <ExternalLink className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden /> : null}
              <ProfileValue value={lead.linkedin_url} href={linkedinHref} />
            </div>
          </Row>
        </SectionCard>

        <SectionCard title="Context" icon={Tag}>
          <Row label="Source">
            <SourceBadge source={lead.source_type} />
          </Row>
          <Row label="About">
            <ProfileValue value={lead.description} emptyLabel="No description on file." />
          </Row>
        </SectionCard>
      </div>
    </div>
  );
}
