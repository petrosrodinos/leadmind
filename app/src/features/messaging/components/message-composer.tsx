import { useState } from "react";
import { Input, Label, ListBox, Select, TextArea, TextField } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Link2, Mail, MessageSquare, Phone, Sparkles } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { OUTREACH_LANGUAGES, type OutreachLanguage } from "@/features/contacts/constants/outreach-languages";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { PlaceholderInsertPopover } from "@/components/ui/placeholder-insert-popover";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";
import {
    AI_ACTION_META,
    DEFAULT_SINGLE_CONTACT_ACTIONS,
    type AiAction,
} from "../constants/ai-actions";

const DEFAULT_LANGUAGE: OutreachLanguage = "English";

export interface MessageComposerValue {
    emailSubject: string;
    emailContent: string;
    smsContent: string;
    callContent: string;
    linkedinContent: string;
}

export interface AiGenerateArgs {
    channel: Channel;
    action: AiAction;
    prompt: string;
    language: OutreachLanguage;
    currentSubject?: string;
    currentContent?: string;
}

export interface MessageComposerProps {
    /** Which channels are user-selectable. Order = tab order. */
    channels: Channel[];
    activeChannel: Channel;
    onActiveChannelChange: (channel: Channel) => void;
    value: MessageComposerValue;
    onChange: (patch: Partial<MessageComposerValue>) => void;
    /** Optional AI generator. Returns the new subject/content for the active channel. */
    onAiGenerate?: (args: AiGenerateArgs) => Promise<{ subject?: string | null; content: string }>;
    /** AI actions to show. Defaults to ["generate"]. Pass DEFAULT_CAMPAIGN_ACTIONS for the campaign flow. */
    aiActions?: AiAction[];
    isAiPending?: boolean;
    /** Disable all inputs (used while a parent mutation is in flight). */
    disabled?: boolean;
    /** Hint text under the message body referencing placeholders. */
    placeholderHint?: React.ReactNode;
    emailSubjectError?: string | null;
}

export function MessageComposer({
    channels,
    activeChannel,
    onActiveChannelChange,
    value,
    onChange,
    onAiGenerate,
    aiActions = DEFAULT_SINGLE_CONTACT_ACTIONS,
    isAiPending = false,
    disabled = false,
    placeholderHint,
    emailSubjectError = null,
}: MessageComposerProps) {
    const [prompt, setPrompt] = useState("");
    const [language, setLanguage] = useState<OutreachLanguage>(DEFAULT_LANGUAGE);

    const isEmail = activeChannel === Channel.EMAIL;
    const isLinkedIn = activeChannel === Channel.LINKEDIN;
    const isCall = activeChannel === Channel.PHONE_CALL;
    const promptEmpty = prompt.trim().length === 0;

    const plainBody = isLinkedIn
        ? value.linkedinContent
        : isCall
          ? value.callContent
          : value.smsContent ?? "";

    const channelHasExisting = isEmail
        ? !isEmailHtmlEmpty(value.emailContent)
        : plainBody.trim().length > 0;

    const setPlainBody = (content: string) => {
        if (isLinkedIn) {
            onChange({ linkedinContent: content });
        } else if (isCall) {
            onChange({ callContent: content });
        } else {
            onChange({ smsContent: content });
        }
    };

    const runAction = async (action: AiAction) => {
        if (!onAiGenerate || isAiPending) return;
        const meta = AI_ACTION_META[action];
        if (meta.requiresExisting && !channelHasExisting) return;
        if (action === "generate" && promptEmpty) return;

        try {
            const result = await onAiGenerate({
                channel: activeChannel,
                action,
                prompt: prompt.trim(),
                language,
                currentSubject: isEmail ? value.emailSubject : undefined,
                currentContent: isEmail ? value.emailContent : plainBody,
            });
            if (isEmail) {
                onChange({
                    emailSubject: result.subject ?? value.emailSubject,
                    emailContent: result.content,
                });
            } else {
                setPlainBody(result.content);
            }
        } catch {
            // toast surfaced by caller hook
        }
    };

    const plainChars = plainBody.length;
    const smsSegments =
        plainChars === 0 ? 0 : Math.ceil(plainChars / (plainChars <= 160 ? 160 : 153));

    return (
        <div className="flex flex-col gap-5">
            {channels.length > 1 && (
                <MessageChannelToggle
                    channels={channels}
                    activeChannel={activeChannel}
                    onChange={onActiveChannelChange}
                    disabled={disabled || isAiPending}
                />
            )}

            {onAiGenerate && (
                <section className="rounded-lg border border-border bg-surface-secondary/40 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-accent" />
                            <Label htmlFor="composer-ai-prompt" className="text-sm font-medium text-foreground">
                                Ask AI to draft this
                            </Label>
                        </div>
                        <Select
                            className="min-w-[160px]"
                            aria-label="Output language"
                            value={language}
                            onChange={(v) => {
                                if (typeof v === "string" && (OUTREACH_LANGUAGES as readonly string[]).includes(v)) {
                                    setLanguage(v as OutreachLanguage);
                                }
                            }}
                            isDisabled={isAiPending}
                        >
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    {OUTREACH_LANGUAGES.map((lang) => (
                                        <ListBox.Item key={lang} id={lang} textValue={lang}>
                                            {lang}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>
                    <TextArea
                        id="composer-ai-prompt"
                        aria-label="AI prompt"
                        rows={3}
                        placeholder={
                            isEmail
                                ? "e.g. Pitch our service to small clinics, offer a 15-min intro call."
                                : isLinkedIn
                                  ? "e.g. Warm connection note referencing their role, invite a quick chat."
                                  : isCall
                                    ? "e.g. Cold call opener for dental clinics, mention free audit, ask for 10-min follow-up."
                                    : "e.g. Friendly check-in inviting them to book a call."
                        }
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isAiPending}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        {aiActions.map((action) => {
                            const meta = AI_ACTION_META[action];
                            const Icon = meta.icon;
                            const requiresExisting = meta.requiresExisting && !channelHasExisting;
                            const requiresPrompt = action === "generate" && promptEmpty;
                            const disabledAction = requiresExisting || requiresPrompt || isAiPending;
                            const tooltip = requiresExisting
                                ? "Write or generate a draft first"
                                : requiresPrompt
                                  ? "Enter a prompt above"
                                  : meta.description;
                            return (
                                <span key={action} title={tooltip} className="inline-flex">
                                    <ActionButtonWithPending
                                        size="sm"
                                        variant={action === "generate" ? "primary" : "secondary"}
                                        isDisabled={disabledAction}
                                        isPending={isAiPending && action === "generate"}
                                        onPress={() => runAction(action)}
                                        idleLeading={<Icon className="size-3.5" />}
                                    >
                                        {meta.label}
                                    </ActionButtonWithPending>
                                </span>
                            );
                        })}
                    </div>
                </section>
            )}

            {isEmail && (
                <TextField className="w-full" name="composer-subject">
                    <Label>Subject</Label>
                    <Input
                        placeholder="Email subject"
                        value={value.emailSubject}
                        onChange={(e) => onChange({ emailSubject: e.target.value })}
                        disabled={disabled || isAiPending}
                        aria-invalid={Boolean(emailSubjectError) || undefined}
                    />
                    {emailSubjectError ? (
                        <p className="mt-1 text-xs text-danger">{emailSubjectError}</p>
                    ) : null}
                </TextField>
            )}

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="composer-content">Message</Label>
                    {!isCall && <PlaceholderInsertPopover />}
                </div>
                {isEmail ? (
                    <RichTextEditor
                        aria-label="Message content"
                        value={value.emailContent}
                        onChange={(v) => onChange({ emailContent: v })}
                        disabled={disabled || isAiPending}
                    />
                ) : (
                    <>
                        <TextArea
                            id="composer-content"
                            aria-label="Message content"
                            rows={8}
                            value={plainBody}
                            onChange={(e) => setPlainBody(e.target.value)}
                            disabled={disabled || isAiPending}
                        />
                        <div className="flex items-center justify-end gap-3 text-xs text-muted">
                            <span>{plainChars} chars</span>
                            {!isLinkedIn && !isCall && (
                                <span>
                                    {smsSegments} segment{smsSegments === 1 ? "" : "s"}
                                </span>
                            )}
                        </div>
                    </>
                )}
                {isCall
                    ? null
                    : placeholderHint ?? (
                          <p className="text-xs text-muted">
                              Placeholders like <code>{"{{first_name}}"}</code> or{" "}
                              <code>{"{{booking_url}}"}</code> are replaced with your sender profile when
                              the message is sent.
                          </p>
                      )}
            </div>
        </div>
    );
}

interface ChannelToggleProps {
    channels: Channel[];
    activeChannel: Channel;
    onChange: (channel: Channel) => void;
    disabled?: boolean;
}

export function MessageChannelToggle({ channels, activeChannel, onChange, disabled }: ChannelToggleProps) {
    return (
        <div
            role="radiogroup"
            aria-label="Channel"
            className="inline-flex self-start rounded-lg border border-border bg-surface-secondary/40 p-0.5"
        >
            {channels.map((c) => (
                <ChannelToggleButton
                    key={c}
                    active={activeChannel === c}
                    onPress={() => onChange(c)}
                    disabled={disabled}
                    icon={
                        c === Channel.EMAIL
                            ? Mail
                            : c === Channel.LINKEDIN
                              ? Link2
                              : c === Channel.PHONE_CALL
                                ? Phone
                                : MessageSquare
                    }
                    label={
                        c === Channel.EMAIL
                            ? "Email"
                            : c === Channel.SMS
                              ? "SMS"
                              : c === Channel.PHONE_CALL
                                ? "Call"
                                : c === Channel.LINKEDIN
                                  ? "LinkedIn"
                                  : c
                    }
                />
            ))}
        </div>
    );
}

interface ChannelToggleButtonProps {
    active: boolean;
    onPress: () => void;
    disabled?: boolean;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

function ChannelToggleButton({ active, onPress, disabled, icon: Icon, label }: ChannelToggleButtonProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={onPress}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                "disabled:opacity-50 disabled:pointer-events-none",
                active
                    ? "bg-surface text-foreground shadow-sm border border-border"
                    : "text-muted hover:text-foreground",
            )}
        >
            <Icon className="size-3.5" />
            {label}
        </button>
    );
}
