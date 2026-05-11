const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export type PlaceholderVars = Record<string, string>;

export function renderPlaceholders(template: string, vars: PlaceholderVars): string {
    if (!template) return template;
    return template.replace(PLACEHOLDER_PATTERN, (_, key: string) => vars[key] ?? '');
}
