import { Chip } from "@heroui/react";
import { Calendar, Link2, Mail, MessageSquare, Sparkles, Users } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { CampaignType } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import type { MessageComposerValue } from "@/features/messaging/components/message-composer";
import type { BasicsValues } from "./step-basics";

interface StepReviewProps {
    basics: BasicsValues;
    audienceCount: number | null;
    message: MessageComposerValue;
    aiPrompt: string;
}

export function StepReview({ basics, audienceCount, message, aiPrompt }: StepReviewProps) {
    const isPersonalized = basics.campaign_type === CampaignType.PERSONALIZED;

    return (
        <div className="flex flex-col gap-5 max-w-3xl">
            <section className="rounded-xl border border-border bg-surface p-4 space-y-2">
                <h2 className="text-sm font-semibold text-foreground">{basics.name || "Untitled campaign"}</h2>
                {basics.description && (
                    <p className="text-sm text-muted">{basics.description}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                    {basics.channels.map((c) => (
                        <Chip key={c} size="sm" variant="soft" color="accent">
                            {c === Channel.EMAIL ? (
                                <Mail className="size-3" />
                            ) : c === Channel.LINKEDIN ? (
                                <Link2 className="size-3" />
                            ) : (
                                <MessageSquare className="size-3" />
                            )}
                            <Chip.Label>{c}</Chip.Label>
                        </Chip>
                    ))}
                    {isPersonalized && (
                        <Chip size="sm" variant="soft" color="success">
                            <Sparkles className="size-3" />
                            <Chip.Label>Personalized</Chip.Label>
                        </Chip>
                    )}
                    {basics.scheduled_at && (
                        <Chip size="sm" variant="soft" color="warning">
                            <Calendar className="size-3" />
                            <Chip.Label>
                                {new Date(basics.scheduled_at).toLocaleString()}
                            </Chip.Label>
                        </Chip>
                    )}
                    <Chip size="sm" variant="soft" color="default">
                        <Users className="size-3" />
                        <Chip.Label>
                            {audienceCount != null ? `${audienceCount} contacts` : "audience pending"}
                        </Chip.Label>
                    </Chip>
                </div>
            </section>

            {isPersonalized && (
                <section className="rounded-xl border border-border bg-surface p-4 space-y-2">
                    <h3 className="text-xs uppercase tracking-wide text-muted">Message goal</h3>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                        {aiPrompt || <span className="text-muted italic">— no prompt set —</span>}
                    </p>
                    <p className="text-xs text-muted">
                        {basics.use_openai_batch
                            ? 'Drafts will be created via the OpenAI Batch API when you click "Generate Drafts" (typically within 24 hours).'
                            : 'The AI will generate a unique message for each contact when you click "Generate Drafts".'}
                    </p>
                </section>
            )}

            {!isPersonalized && basics.channels.includes(Channel.EMAIL) && (
                <section className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <h3 className="text-xs uppercase tracking-wide text-muted">Email</h3>
                    <div>
                        <div className="text-xs text-muted">Subject</div>
                        <div className="text-sm font-medium text-foreground">
                            {message.emailSubject || <span className="text-muted italic">— missing —</span>}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-muted">Body preview</div>
                        <div
                            className="prose prose-sm max-w-none rounded-lg border border-border bg-surface-secondary/30 p-3 text-sm"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: message.emailContent || "<p style='color:#888'>— missing —</p>",
                            }}
                        />
                    </div>
                </section>
            )}

            {!isPersonalized && basics.channels.includes(Channel.SMS) && (
                <section className="rounded-xl border border-border bg-surface p-4 space-y-2">
                    <h3 className="text-xs uppercase tracking-wide text-muted">SMS</h3>
                    <div className="rounded-lg border border-border bg-surface-secondary/30 p-3 text-sm whitespace-pre-wrap">
                        {message.smsContent || <span className="text-muted italic">— missing —</span>}
                    </div>
                    {message.smsContent && (
                        <div className="text-xs text-muted">
                            {message.smsContent.length} chars ·{" "}
                            {message.smsContent.length === 0
                                ? 0
                                : Math.ceil(
                                      message.smsContent.length /
                                          (message.smsContent.length <= 160 ? 160 : 153),
                                  )}{" "}
                            segments
                        </div>
                    )}
                </section>
            )}

            {!isPersonalized && basics.channels.includes(Channel.LINKEDIN) && (
                <section className="rounded-xl border border-border bg-surface p-4 space-y-2">
                    <h3 className="text-xs uppercase tracking-wide text-muted">LinkedIn</h3>
                    <div className="rounded-lg border border-border bg-surface-secondary/30 p-3 text-sm whitespace-pre-wrap">
                        {message.linkedinContent || <span className="text-muted italic">— missing —</span>}
                    </div>
                    {message.linkedinContent && (
                        <div className="text-xs text-muted">{message.linkedinContent.length} chars</div>
                    )}
                </section>
            )}
        </div>
    );
}
