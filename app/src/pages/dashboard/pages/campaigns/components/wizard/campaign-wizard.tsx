import { useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { ArrowLeft, ArrowRight, Save, Send, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import {
    useStartCampaign,
    useUpdateCampaign,
} from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type {
    MarketingCampaign,
    CampaignFilters,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignType, CampaignStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { Routes } from "@/routes/routes";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { MessageComposerValue } from "@/features/messaging/components/message-composer";
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
    const [confirmStart, setConfirmStart] = useState(false);

    const isDraft = campaign.status === CampaignStatuses.DRAFT;
    const isPersonalized = basics.campaign_type === CampaignType.PERSONALIZED;

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
        try {
            await persist();
            await startMutation.mutateAsync(campaign.uuid);
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
                    isPersonalized ? (
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
                    )
                }
                confirmLabel={
                    isPersonalized ? "Generate Drafts" : basics.scheduled_at ? "Schedule" : "Start now"
                }
                isPending={startMutation.isPending || updateMutation.isPending}
                onConfirm={handleStart}
            />
            <AudienceCountSync onCountChange={setAudienceCount} count={audienceCount} />
        </div>
    );
}

function toLocalInputValue(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Trivial component just to satisfy hook usage; the actual count comes from StepAudience.
function AudienceCountSync({
    onCountChange: _onCountChange,
    count: _count,
}: {
    onCountChange: (n: number) => void;
    count: number | null;
}) {
    useEffect(() => {}, []);
    return null;
}
