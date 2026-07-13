import { useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { ArrowLeft, ArrowRight, Save, Send, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import {
    usePreviewCampaignContacts,
    useStartCampaign,
    useUpdateCampaign,
} from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type {
    MarketingCampaign,
    CampaignFilters,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignType, CampaignStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import type { EmailProviderAllocation } from "@/features/integrations/interfaces/integrations.interface";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { Routes } from "@/routes/routes";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { MessageComposerValue } from "@/features/messaging/components/message-composer";
import {
    EmailProviderSelect,
    isEmailProviderAllocationValid,
} from "@/features/messaging/components/email-provider-select";
import { SenderProfileSelect } from "@/features/messaging/components/sender-profile-select";
import { WizardShell, type WizardStepKey, WIZARD_STEPS } from "./wizard-shell";
import { StepBasics, type BasicsValues } from "./step-basics";
import { StepAudience } from "./step-audience";
import { StepMessage } from "./step-message";
import { StepReview } from "./step-review";

interface CampaignWizardProps {
    campaign: MarketingCampaign;
}

export function CampaignWizard({ campaign }: CampaignWizardProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const updateMutation = useUpdateCampaign();
    const startMutation = useStartCampaign();
    const previewContacts = usePreviewCampaignContacts();

    const initialStep = ((): WizardStepKey => {
        const requested = searchParams.get("step") as WizardStepKey | null;
        if (requested && WIZARD_STEPS.some((s) => s.key === requested)) return requested;
        return "basics";
    })();
    const [activeStep, setActiveStep] = useState<WizardStepKey>(initialStep);

    const initialBasics: BasicsValues = useMemo(
        () => ({
            name: campaign.name,
            description: campaign.description ?? "",
            campaign_type: campaign.campaign_type ?? CampaignType.STANDARD,
            channels: campaign.channels.length ? campaign.channels : [Channel.EMAIL],
            scheduled_at: campaign.scheduled_at
                ? toLocalInputValue(campaign.scheduled_at)
                : null,
            use_openai_batch: campaign.use_openai_batch ?? false,
        }),
        [campaign],
    );

    const initialFilters: CampaignFilters = useMemo(
        () => (campaign.filters_snapshot as CampaignFilters) ?? {},
        [campaign],
    );

    const initialMessage: MessageComposerValue = useMemo(
        () => ({
            emailSubject: campaign.email_subject ?? "",
            emailContent: campaign.email_content ?? "",
            smsContent: campaign.sms_content ?? "",
            callContent: "",
            linkedinContent: campaign.linkedin_content ?? "",
        }),
        [campaign],
    );

    const [basics, setBasics] = useState<BasicsValues>(initialBasics);
    const [filters, setFilters] = useState<CampaignFilters>(initialFilters);
    const [message, setMessage] = useState<MessageComposerValue>(initialMessage);
    const [aiPrompt, setAiPrompt] = useState<string>(campaign.ai_prompt ?? "");
    const [audienceCount, setAudienceCount] = useState<number | null>(
        campaign.selected_contact_count > 0 ? campaign.selected_contact_count : null,
    );
    const [emailAudienceCount, setEmailAudienceCount] = useState<number>(
        campaign.selected_contact_count > 0 ? campaign.selected_contact_count : 0,
    );
    const [emailAllocations, setEmailAllocations] = useState<EmailProviderAllocation[]>(
        () => campaign.email_provider_allocations ?? [],
    );
    const [senderProfileUuid, setSenderProfileUuid] = useState<string | null>(
        campaign.sender_profile_uuid,
    );
    const [confirmStart, setConfirmStart] = useState(false);

    const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

    const isDraft = campaign.status === CampaignStatuses.DRAFT;
    const isPersonalized = basics.campaign_type === CampaignType.PERSONALIZED;
    const includesEmail = basics.channels.includes(Channel.EMAIL);
    const showEmailProvider = includesEmail && !isPersonalized;
    const emailProviderMissing =
        showEmailProvider &&
        emailAudienceCount > 0 &&
        !isEmailProviderAllocationValid(emailAllocations, emailAudienceCount);

    useEffect(() => {
        if (activeStep !== "review") return;

        let cancelled = false;
        void previewContacts
            .mutateAsync({ uuid: campaign.uuid, filters })
            .then((result) => {
                if (cancelled) return;
                const excluded = new Set(filters.exclude_uuids ?? []);
                let sendable = result.total;
                if (basics.channels.includes(Channel.EMAIL)) {
                    sendable = Math.min(sendable, result.with_email);
                }
                if (basics.channels.includes(Channel.SMS)) {
                    sendable = Math.min(sendable, result.with_phone);
                }
                setAudienceCount(Math.max(0, sendable - excluded.size));
                if (basics.channels.includes(Channel.EMAIL)) {
                    setEmailAudienceCount(
                        Math.max(
                            0,
                            Math.min(result.with_email, result.total) - excluded.size,
                        ),
                    );
                }
            })
            .catch(() => {
                // preview errors surfaced by hook
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, campaign.uuid, serializedFilters, basics.channels]);

    const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === activeStep);
    const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

    const canProceedFromBasics = basics.name.trim().length > 0 && basics.channels.length > 0;

    const persist = async (extra?: Record<string, unknown>) => {
        const payload: Record<string, unknown> = {
            name: basics.name,
            description: basics.description || undefined,
            campaign_type: basics.campaign_type,
            channels: basics.channels,
            filters,
            ...(isPersonalized
                ? {
                      ai_prompt: aiPrompt || undefined,
                      use_openai_batch: basics.use_openai_batch,
                      email_subject: null,
                      email_content: null,
                      sms_content: null,
                      linkedin_content: null,
                      scheduled_at: null,
                  }
                : {
                      scheduled_at: basics.scheduled_at
                          ? new Date(basics.scheduled_at).toISOString()
                          : null,
                      email_subject: basics.channels.includes(Channel.EMAIL)
                          ? message.emailSubject || undefined
                          : null,
                      email_content: basics.channels.includes(Channel.EMAIL)
                          ? (isEmailHtmlEmpty(message.emailContent) ? undefined : message.emailContent)
                          : null,
                      sms_content: basics.channels.includes(Channel.SMS)
                          ? message.smsContent || undefined
                          : null,
                      linkedin_content: basics.channels.includes(Channel.LINKEDIN)
                          ? message.linkedinContent || undefined
                          : null,
                  }),
            ...(showEmailProvider && emailAllocations.length > 0
                ? {
                      email_provider_allocations: emailAllocations,
                  }
                : {}),
            ...(senderProfileUuid ? { sender_profile_uuid: senderProfileUuid } : {}),
            ...extra,
        };
        return updateMutation.mutateAsync({ uuid: campaign.uuid, payload: payload as any });
    };

    const goNext = async () => {
        if (!isDraft) {
            setActiveStep(WIZARD_STEPS[Math.min(stepIndex + 1, WIZARD_STEPS.length - 1)].key);
            return;
        }
        try {
            await persist();
            setActiveStep(WIZARD_STEPS[Math.min(stepIndex + 1, WIZARD_STEPS.length - 1)].key);
        } catch {
            // toast surfaced
        }
    };

    const goPrev = () => {
        if (stepIndex > 0) {
            setActiveStep(WIZARD_STEPS[stepIndex - 1].key);
        }
    };

    const handleStart = async () => {
        if (emailProviderMissing) return;
        if (!senderProfileUuid) return;
        try {
            await persist();
            await startMutation.mutateAsync({
                uuid: campaign.uuid,
                ...(showEmailProvider && emailAllocations.length > 0
                    ? {
                          email_provider_allocations: emailAllocations,
                      }
                    : {}),
                sender_profile_uuid: senderProfileUuid,
            });
            navigate(`/dashboard/campaigns/${campaign.uuid}`);
        } catch {
            // toast surfaced
        }
    };

    const handleSaveAndClose = async () => {
        try {
            await persist();
            navigate(Routes.dashboard.campaigns);
        } catch {
            // toast surfaced
        }
    };

    const startLabel = isPersonalized
        ? "Generate Drafts"
        : basics.scheduled_at
        ? "Schedule campaign"
        : "Start campaign";

    return (
        <div className="space-y-6">
            <WizardShell activeStep={activeStep} onSelect={setActiveStep}>
                {activeStep === "basics" && (
                    <StepBasics value={basics} onChange={(p) => setBasics((v) => ({ ...v, ...p }))} />
                )}
                {activeStep === "audience" && (
                    <StepAudience
                        campaignUuid={campaign.uuid}
                        channels={basics.channels}
                        value={filters}
                        onChange={setFilters}
                        onCountsChange={({ sendable, email }) => {
                            setAudienceCount(sendable);
                            setEmailAudienceCount(email);
                        }}
                    />
                )}
                {activeStep === "message" && (
                    <StepMessage
                        campaignUuid={campaign.uuid}
                        campaignType={basics.campaign_type}
                        channels={basics.channels}
                        value={message}
                        onChange={setMessage}
                        aiPrompt={aiPrompt}
                        onAiPromptChange={setAiPrompt}
                    />
                )}
                {activeStep === "review" && (
                    <StepReview
                        basics={basics}
                        audienceCount={audienceCount}
                        message={message}
                        aiPrompt={aiPrompt}
                        onBasicsChange={(patch) => setBasics((v) => ({ ...v, ...patch }))}
                    />
                )}
            </WizardShell>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <Button variant="ghost" onPress={goPrev} isDisabled={stepIndex === 0}>
                    <ArrowLeft className="size-4" /> Back
                </Button>
                <div className="flex items-center gap-2">
                    {isDraft && (
                        <ActionButtonWithPending
                            variant="secondary"
                            onPress={handleSaveAndClose}
                            isPending={updateMutation.isPending && !startMutation.isPending}
                            idleLeading={<Save className="size-4" />}
                        >
                            Save & close
                        </ActionButtonWithPending>
                    )}
                    {!isLastStep ? (
                        <Button
                            onPress={goNext}
                            isDisabled={
                                activeStep === "basics" && !canProceedFromBasics
                            }
                            isPending={updateMutation.isPending}
                        >
                            {({ isPending: p }) => (
                                <>
                                    {p ? <Spinner color="current" size="sm" className="shrink-0" /> : null}
                                    Next
                                    {!p ? <ArrowRight className="size-4" /> : null}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onPress={() => setConfirmStart(true)}
                            isDisabled={!isDraft}
                        >
                            {isPersonalized ? <Sparkles className="size-4" /> : <Send className="size-4" />}
                            {startLabel}
                        </Button>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmStart}
                onOpenChange={setConfirmStart}
                title={
                    isPersonalized
                        ? "Generate personalized drafts?"
                        : basics.scheduled_at
                        ? "Schedule this campaign?"
                        : "Start this campaign?"
                }
                description={
                    <>
                        {isPersonalized ? (
                            <>
                                {basics.use_openai_batch ? (
                                    <>
                                        Drafts will be queued via the OpenAI Batch API (typically within 24
                                        hours). You can review them before sending once they are ready.
                                    </>
                                ) : (
                                    <>
                                        The AI will generate a unique message for each matched contact. You
                                        can review the drafts before sending.
                                    </>
                                )}
                            </>
                        ) : basics.scheduled_at ? (
                            <>
                                The campaign will dispatch at{" "}
                                <span className="font-medium">
                                    {new Date(basics.scheduled_at).toLocaleString()}
                                </span>
                                . You can cancel any time before then.
                            </>
                        ) : (
                            <>This will dispatch the campaign to all matched contacts immediately.</>
                        )}
                        {showEmailProvider ? (
                            <div className="mt-4">
                                <EmailProviderSelect
                                    totalCount={emailAudienceCount}
                                    value={emailAllocations}
                                    onChange={setEmailAllocations}
                                    disabled={startMutation.isPending || updateMutation.isPending}
                                />
                            </div>
                        ) : null}
                        <div className="mt-4">
                            <SenderProfileSelect
                                value={senderProfileUuid}
                                onChange={setSenderProfileUuid}
                                disabled={startMutation.isPending || updateMutation.isPending}
                            />
                        </div>
                    </>
                }
                confirmLabel={
                    isPersonalized ? "Generate Drafts" : basics.scheduled_at ? "Schedule" : "Start now"
                }
                isPending={startMutation.isPending || updateMutation.isPending}
                isConfirmDisabled={emailProviderMissing || !senderProfileUuid}
                onConfirm={handleStart}
            />
        </div>
    );
}

function toLocalInputValue(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
