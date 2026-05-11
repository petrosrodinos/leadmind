import sanitizeHtml = require('sanitize-html');

const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'h1',
    'h2',
    'h3',
];

const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
        a: ['href'],
    },
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesAppliedToAttributes: ['href'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
            target: '_blank',
            rel: 'noopener noreferrer',
        }),
    },
};

export function sanitizeEmailHtml(input: string): string {
    if (!input) return '';
    return sanitizeHtml(input, SANITIZE_OPTIONS);
}

export function isEmailHtmlEmpty(html: string): boolean {
    const stripped = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
    return stripped.replace(/\s|&nbsp;/g, '').length === 0;
}
