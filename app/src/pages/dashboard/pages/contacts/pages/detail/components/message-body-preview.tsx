import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { sanitizeEmailHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

interface MessageBodyPreviewProps {
    channel: Channel;
    content: string;
    className?: string;
}

const htmlStyles =
    "text-sm text-muted " +
    "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 " +
    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 " +
    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 " +
    "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:my-1 " +
    "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:my-1 " +
    "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:my-1 " +
    "[&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_u]:underline";

export function MessageBodyPreview({ channel, content, className }: MessageBodyPreviewProps) {
    if (channel === Channel.EMAIL) {
        return (
            <div
                className={cn(htmlStyles, className)}
                dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(content) }}
            />
        );
    }
    return (
        <p className={cn("text-sm text-muted whitespace-pre-line", className)}>{content}</p>
    );
}
