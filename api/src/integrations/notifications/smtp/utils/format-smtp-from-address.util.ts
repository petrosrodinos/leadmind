export function formatSmtpFromAddress(
    fromEmail: string,
    fromName?: string | null,
): string {
    const address = fromEmail.trim();
    const name = fromName?.trim();
    if (!name) {
        return address;
    }

    const escaped = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}" <${address}>`;
}
