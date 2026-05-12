import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "h1",
    "h2",
    "h3",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

const FORBID_TAGS = ["script", "iframe", "img", "style", "html", "body", "head", "meta"];

const FORBID_ATTR = ["style", "class", "id"];

export function sanitizeEmailHtml(input: string): string {
    if (!input) return "";
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        FORBID_TAGS,
        FORBID_ATTR,
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\{\{[a-zA-Z0-9_]+\}\}$)/i,
        ADD_ATTR: ["target", "rel"],
    });
}

export function isEmailHtmlEmpty(html: string): boolean {
    const stripped = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    return stripped.replace(/\s|&nbsp;/g, "").length === 0;
}
