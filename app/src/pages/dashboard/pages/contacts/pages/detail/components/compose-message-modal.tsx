import { useState } from "react";
import {
    Button,
    Input,
    Label,
    ListBox,
    Modal,
    Select,
    TextArea,
    TextField,
} from "@heroui/react";
import { Mail, MessageSquare, Save, Send, Sparkles } from "lucide-react";
import {
    Channel,
    type CreateMessagePayload,
} from "@/features/contacts/interfaces/contact.interface";
import { useAiDraftMessage } from "@/features/contacts/hooks/use-contacts";
import {
    useCreateAndSendMessage,
    useCreateDraftMessage,
} from "@/features/outreach/hooks/use-outreach";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";
import {
    OUTREACH_LANGUAGES,
    type OutreachLanguage,
} from "@/features/contacts/constants/outreach-languages";

const DEFAULT_LANGUAGE: OutreachLanguage = "English";

interface ComposeMessageModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contact_uuid: string;
}

export function ComposeMessageModal({
    isOpen,
    onOpenChange,
    contact_uuid,
}: ComposeMessageModalProps) {
    const [mountKey, setMountKey] = useState(0);

    const handleOpenChange = (open: boolean) => {
        if (open) setMountKey((k) => k + 1);
        onOpenChange(open);
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    {isOpen ? (
                        <ComposeForm
                            key={mountKey}
                            contact_uuid={contact_uuid}
                            onClose={() => onOpenChange(false)}
                        />
                    ) : null}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}

interface ComposeFormProps {
    contact_uuid: string;
    onClose: () => void;
}

function ComposeForm({ contact_uuid, onClose }: ComposeFormProps) {
    const [channel, setChannel] = useState<Channel>(Channel.EMAIL);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [prompt, setPrompt] = useState("");
    const [language, setLanguage] = useState<OutreachLanguage>(DEFAULT_LANGUAGE);

    const aiDraft = useAiDraftMessage();
    const createDraft = useCreateDraftMessage();
    const createAndSend = useCreateAndSendMessage();

    const isEmail = channel === Channel.EMAIL;
    const isPending = aiDraft.isPending || createDraft.isPending || createAndSend.isPending;

    const contentEmpty = isEmail ? isEmailHtmlEmpty(content) : content.trim().length === 0;
    const promptEmpty = prompt.trim().length === 0;

    const handleChannelChange = (next: Channel) => {
        if (isPending || next === channel) return;
        setChannel(next);
        if (next === Channel.SMS) setSubject("");
    };

    const handleGenerate = async () => {
        if (promptEmpty || aiDraft.isPending) return;
        try {
            const result = await aiDraft.mutateAsync({
                contact_uuid,
                channel,
                prompt: prompt.trim(),
                language,
            });
            if (isEmail) setSubject(result.subject ?? "");
            setContent(result.content);
        } catch {
            // toast surfaced by hook
        }
    };

    const buildPayload = (): CreateMessagePayload => ({
        channel,
        content,
        contact_uuid,
        ...(isEmail && subject.trim() ? { subject: subject.trim() } : {}),
    });

    const handleSaveDraft = async () => {
        if (contentEmpty || createDraft.isPending) return;
        try {
            await createDraft.mutateAsync(buildPayload());
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const handleSend = async () => {
        if (contentEmpty || createAndSend.isPending) return;
        try {
            await createAndSend.mutateAsync(buildPayload());
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    return (
        <>
            <Modal.Header>
                <Modal.Heading>Compose new message</Modal.Heading>
            </Modal.Header>
            <div className="flex min-h-0 flex-1 flex-col">
                <Modal.Body className="p-6">
                    <div className="flex flex-col gap-5">
                        <ChannelToggle
                            channel={channel}
                            onChange={handleChannelChange}
                            disabled={isPending}
                        />

                        <section className="rounded-lg border border-border bg-surface-secondary/40 p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-accent" />
                                    <Label htmlFor="compose-ai-prompt" className="text-sm font-medium text-foreground">
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
                                    isDisabled={aiDraft.isPending}
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
                                id="compose-ai-prompt"
                                aria-label="AI prompt"
                                rows={3}
                                placeholder={
                                    isEmail
                                        ? "e.g. Reference their recent enrichment summary and offer a 15-min intro call via my booking link."
                                        : "e.g. Short check-in, mention my booking link for a call."
                                }
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={aiDraft.isPending}
                            />
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-muted">
                                    AI uses this contact's profile + your prompt, in{" "}
                                    <span className="font-medium text-foreground">{language}</span>.
                                    Output goes into the form below — edit freely before saving or sending.
                                </p>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    isDisabled={promptEmpty || aiDraft.isPending}
                                    isPending={aiDraft.isPending}
                                    onPress={handleGenerate}
                                >
                                    <Sparkles className="size-3.5" />
                                    Generate
                                </Button>
                            </div>
                        </section>

                        {isEmail && (
                            <TextField className="w-full" name="subject">
                                <Label>Subject</Label>
                                <Input
                                    placeholder="Email subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </TextField>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="compose-content">Message</Label>
                            {isEmail ? (
                                <RichTextEditor
                                    aria-label="Message content"
                                    value={content}
                                    onChange={setContent}
                                    disabled={aiDraft.isPending}
                                />
                            ) : (
                                <TextArea
                                    id="compose-content"
                                    aria-label="Message content"
                                    rows={8}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    disabled={aiDraft.isPending}
                                />
                            )}
                            <p className="text-xs text-muted">
                                Placeholders like <code>{"{{first_name}}"}</code> or{" "}
                                <code>{"{{booking_url}}"}</code> are replaced with your default
                                sender profile when the message is sent.
                            </p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button slot="close" variant="secondary" type="button">
                        Cancel
                    </Button>
                    <Button
                        variant="tertiary"
                        isDisabled={contentEmpty || isPending}
                        isPending={createDraft.isPending}
                        onPress={handleSaveDraft}
                    >
                        <Save className="size-4" />
                        Save draft
                    </Button>
                    <Button
                        isDisabled={contentEmpty || isPending}
                        isPending={createAndSend.isPending}
                        onPress={handleSend}
                    >
                        <Send className="size-4" />
                        Send
                    </Button>
                </Modal.Footer>
            </div>
        </>
    );
}

interface ChannelToggleProps {
    channel: Channel;
    onChange: (channel: Channel) => void;
    disabled?: boolean;
}

function ChannelToggle({ channel, onChange, disabled }: ChannelToggleProps) {
    return (
        <div
            role="radiogroup"
            aria-label="Channel"
            className="inline-flex self-start rounded-lg border border-border bg-surface-secondary/40 p-0.5"
        >
            <ChannelToggleButton
                active={channel === Channel.EMAIL}
                onPress={() => onChange(Channel.EMAIL)}
                disabled={disabled}
                icon={Mail}
                label="Email"
            />
            <ChannelToggleButton
                active={channel === Channel.SMS}
                onPress={() => onChange(Channel.SMS)}
                disabled={disabled}
                icon={MessageSquare}
                label="SMS"
            />
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

function ChannelToggleButton({
    active,
    onPress,
    disabled,
    icon: Icon,
    label,
}: ChannelToggleButtonProps) {
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
