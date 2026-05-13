import { MAX_GOOGLE_CONTEXT_CHARS, MAX_WEBSITE_ENRICHMENT_SUMMARY_CONTEXT_CHARS } from '../constants/ai-config';

const MAX_LINKEDIN_AI_CONTEXT_CHARS = 8_000;

export function summarizeLinkedInPlain(plain: Record<string, unknown> | null): string {
    if (!plain) {
        return '';
    }
    const headline = typeof plain.headline === 'string' ? plain.headline.trim() : '';
    const name =
        typeof plain.fullName === 'string'
            ? plain.fullName.trim()
            : typeof plain.name === 'string'
              ? plain.name.trim()
              : '';
    const company =
        typeof plain.company === 'string'
            ? plain.company.trim()
            : typeof plain.companyName === 'string'
              ? plain.companyName.trim()
              : '';
    const parts = [name, headline, company].filter(Boolean).slice(0, 3);
    return parts.join(' — ');
}

function linkedInIndustryLabel(value: unknown): string {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const o = value as Record<string, unknown>;
        const n = typeof o.name === 'string' ? o.name.trim() : '';
        const t = typeof o.title === 'string' ? o.title.trim() : '';
        if (n && t && n !== t) {
            return `${n} (${t})`;
        }
        return n || t || '';
    }
    if (Array.isArray(value)) {
        const parts: string[] = [];
        for (const x of value.slice(0, 4)) {
            const s = linkedInIndustryLabel(x);
            if (s) {
                parts.push(s);
            }
        }
        return parts.join(', ');
    }
    return '';
}

function linkedInSizeLabel(value: unknown): string {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return '';
    }
    const o = value as Record<string, unknown>;
    const start = o.start;
    const end = o.end;
    if (typeof start === 'number' && typeof end === 'number') {
        if (start === end) {
            return `About ${start} employees`;
        }
        return `${start}–${end} employees`;
    }
    if (typeof start === 'number') {
        return `${start}+ employees`;
    }
    if (typeof end === 'number') {
        return `Up to ${end} employees`;
    }
    return '';
}

export function buildLinkedInDeterministicSummary(
    plain: Record<string, unknown> | null,
    subtype: 'profile' | 'company',
): string {
    if (!plain) {
        return '';
    }
    const chunks: string[] = [];
    if (subtype === 'company') {
        const name = typeof plain.name === 'string' ? plain.name.trim() : '';
        if (name) {
            chunks.push(name);
        }
        const tagline = typeof plain.tagline === 'string' ? plain.tagline.trim() : '';
        if (tagline) {
            chunks.push(tagline);
        }
        const desc = typeof plain.description === 'string' ? plain.description.trim() : '';
        if (desc) {
            chunks.push(desc.length > 2_500 ? `${desc.slice(0, 2_500)}…` : desc);
        }
        const ind =
            linkedInIndustryLabel(plain.industry) || linkedInIndustryLabel(plain.industries);
        if (ind) {
            chunks.push(`Industry: ${ind}`);
        }
        const web = typeof plain.website === 'string' ? plain.website.trim() : '';
        if (web) {
            chunks.push(`Website: ${web}`);
        }
        const band =
            linkedInSizeLabel(plain.company_size) || linkedInSizeLabel(plain.employeeCountRange);
        if (band) {
            chunks.push(`Company size: ${band}`);
        }
        const ec =
            typeof plain.employee_count === 'number' && Number.isFinite(plain.employee_count)
                ? plain.employee_count
                : null;
        const fc =
            typeof plain.follower_count === 'number' && Number.isFinite(plain.follower_count)
                ? plain.follower_count
                : null;
        const stats: string[] = [];
        if (ec && ec > 0) {
            stats.push(`Listed employee count: ${ec}`);
        }
        if (fc && fc > 0) {
            stats.push(`Followers: ${fc}`);
        }
        if (stats.length) {
            chunks.push(stats.join('. '));
        }
        const li = typeof plain.linkedin_url === 'string' ? plain.linkedin_url.trim() : '';
        if (li) {
            chunks.push(`LinkedIn: ${li}`);
        }
    } else {
        const name =
            (typeof plain.fullName === 'string' && plain.fullName.trim()) ||
            (typeof plain.name === 'string' && plain.name.trim()) ||
            '';
        if (name) {
            chunks.push(name);
        }
        const headline =
            (typeof plain.headline === 'string' && plain.headline.trim()) ||
            (typeof plain.title === 'string' && plain.title.trim()) ||
            '';
        if (headline) {
            chunks.push(headline);
        }
        const co =
            (typeof plain.company === 'string' && plain.company.trim()) ||
            (typeof plain.companyName === 'string' && plain.companyName.trim()) ||
            '';
        if (co) {
            chunks.push(`Company: ${co}`);
        }
        const loc = typeof plain.location === 'string' ? plain.location.trim() : '';
        if (loc) {
            chunks.push(`Location: ${loc}`);
        }
        const ind = linkedInIndustryLabel(plain.industry);
        if (ind) {
            chunks.push(`Industry: ${ind}`);
        }
        const about = typeof plain.about === 'string' ? plain.about.trim() : '';
        if (about) {
            chunks.push(about.length > 2_500 ? `${about.slice(0, 2_500)}…` : about);
        }
        const web = typeof plain.website === 'string' ? plain.website.trim() : '';
        if (web) {
            chunks.push(`Website: ${web}`);
        }
        const li = typeof plain.linkedin_url === 'string' ? plain.linkedin_url.trim() : '';
        if (li) {
            chunks.push(`LinkedIn: ${li}`);
        }
    }
    const joined = chunks.join('\n\n').trim();
    if (joined.length > 0) {
        return joined.length > 12_000 ? `${joined.slice(0, 12_000)}…` : joined;
    }
    return summarizeLinkedInPlain(plain);
}

export function extractLinkedInDataFromEnrichmentPayload(payload: unknown): Record<string, unknown> | null {
    if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
        return null;
    }
    const data = (payload as Record<string, unknown>).data;
    if (data == null || typeof data !== 'object' || Array.isArray(data)) {
        return null;
    }
    return data as Record<string, unknown>;
}

export function linkedInPlainForAiContext(
    plain: Record<string, unknown>,
    subtype: 'profile' | 'company',
): string {
    const { raw_data: _r, ...rest } = plain;
    const keys =
        subtype === 'company'
            ? ([
                  'name',
                  'linkedin_url',
                  'linkedin_username',
                  'website',
                  'description',
                  'tagline',
                  'industry',
                  'industries',
                  'company_size',
                  'employee_count',
                  'follower_count',
                  'headquarters',
                  'locations',
                  'phone',
                  'email',
                  'specialties',
              ] as const)
            : ([
                  'name',
                  'first_name',
                  'last_name',
                  'headline',
                  'title',
                  'company',
                  'company_linkedin_url',
                  'linkedin_url',
                  'linkedin_username',
                  'location',
                  'industry',
                  'about',
                  'email',
                  'phone',
                  'website',
                  'skills',
              ] as const);
    const out: Record<string, unknown> = {};
    for (const k of keys) {
        const v = rest[k];
        if (v !== undefined && v !== null) {
            out[k] = v;
        }
    }
    let s = JSON.stringify(out);
    if (s.length > MAX_LINKEDIN_AI_CONTEXT_CHARS) {
        s = `${s.slice(0, MAX_LINKEDIN_AI_CONTEXT_CHARS)}…`;
    }
    return s;
}

export function buildWebsiteDeterministicSummary(args: {
    url: string;
    title?: string | null;
    textSample?: string | null;
    markdownSample?: string | null;
}): string {
    const chunks: string[] = [];
    const u = args.url.trim();
    if (u) {
        chunks.push(`URL: ${u}`);
    }
    const tit = typeof args.title === 'string' ? args.title.trim() : '';
    if (tit) {
        chunks.push(tit);
    }
    const raw =
        (typeof args.textSample === 'string' && args.textSample.trim()) ||
        (typeof args.markdownSample === 'string' && args.markdownSample.trim()) ||
        '';
    if (raw) {
        const cap = 4_000;
        chunks.push(raw.length > cap ? `${raw.slice(0, cap)}…` : raw);
    }
    const joined = chunks.join('\n\n').trim();
    return joined.length > 0 ? (joined.length > 12_000 ? `${joined.slice(0, 12_000)}…` : joined) : u;
}

export function websiteEnrichmentForAiContext(args: {
    url: string;
    title?: string | null;
    textSample?: string | null;
    markdownSample?: string | null;
}): string {
    const excerpt =
        (typeof args.textSample === 'string' && args.textSample.trim()) ||
        (typeof args.markdownSample === 'string' && args.markdownSample.trim()) ||
        '';
    const cap = Math.max(0, MAX_WEBSITE_ENRICHMENT_SUMMARY_CONTEXT_CHARS - 400);
    const excerptTrim = excerpt.slice(0, cap);
    const o = {
        url: args.url.trim(),
        title: typeof args.title === 'string' && args.title.trim() ? args.title.trim() : null,
        excerpt: excerptTrim.length > 0 ? excerptTrim : null,
    };
    let s = JSON.stringify(o);
    if (s.length > MAX_WEBSITE_ENRICHMENT_SUMMARY_CONTEXT_CHARS) {
        s = `${s.slice(0, MAX_WEBSITE_ENRICHMENT_SUMMARY_CONTEXT_CHARS)}…`;
    }
    return s;
}

export function buildGoogleDeterministicSummary(
    query: string,
    results: { title?: string; url?: string; snippet?: string }[],
): string {
    const lines = [`Search query: ${query.trim()}`];
    for (const r of results.slice(0, 14)) {
        const title = typeof r.title === 'string' ? r.title.trim() : '';
        const url = typeof r.url === 'string' ? r.url.trim() : '';
        const snippet = typeof r.snippet === 'string' ? r.snippet.trim() : '';
        const parts = [title, url, snippet].filter(Boolean);
        if (parts.length) {
            lines.push(parts.join(' — '));
        }
    }
    const s = lines.join('\n').trim();
    return s.length > 12_000 ? `${s.slice(0, 12_000)}…` : s;
}

export function googleSearchPayloadToContext(payload: unknown): string | null {
    if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
        return null;
    }
    const o = payload as Record<string, unknown>;
    const results = o.results;
    if (!Array.isArray(results) || results.length === 0) {
        return null;
    }
    const lines: string[] = [];
    for (const r of results.slice(0, 14)) {
        if (r == null || typeof r !== 'object' || Array.isArray(r)) {
            continue;
        }
        const x = r as Record<string, unknown>;
        const title = typeof x.title === 'string' ? x.title.trim() : '';
        const url = typeof x.url === 'string' ? x.url.trim() : '';
        const snippet = typeof x.snippet === 'string' ? x.snippet.trim() : '';
        const line = [title, url, snippet].filter(Boolean).join(' | ');
        if (line) {
            lines.push(line);
        }
    }
    if (lines.length === 0) {
        return null;
    }
    let s = lines.join('\n');
    if (s.length > MAX_GOOGLE_CONTEXT_CHARS) {
        s = `${s.slice(0, MAX_GOOGLE_CONTEXT_CHARS)}…`;
    }
    return s;
}

export function normalizeWebsiteUrl(raw: string): string {
    const t = raw.trim();
    if (!t) return t;
    return t.startsWith('http') ? t : `https://${t}`;
}

export function isLinkedInCompanyUrl(url: string): boolean {
    return /linkedin\.com\/company\//i.test(url);
}

export function isLinkedInProfileUrl(url: string): boolean {
    return /linkedin\.com\/in\//i.test(url);
}

export function toPlainRecord(v: unknown): Record<string, unknown> | null {
    if (v == null) return null;
    try {
        return JSON.parse(JSON.stringify(v)) as Record<string, unknown>;
    } catch {
        return null;
    }
}
