import { useEffect, useMemo, useState } from "react";
import { PersonalizedMessageGoalField } from "@/features/messaging/components/personalized-message-goal-field";
import { MessageComposer, type MessageComposerValue } from "@/features/messaging/components/message-composer";
import { MessageTemplateSelect } from "@/features/messaging/components/message-template-select";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { CampaignType } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { useCampaignAiGenerate } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import {
    mergeTemplateIntoComposer,
    preferredChannelAfterTemplateApply,
} from "@/features/message-templates/utils/message-template-composer.utils";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";

interface StepMessageProps {
  campaignUuid: string;
  campaignType: CampaignType;
  channels: Channel[];
  value: MessageComposerValue;
  onChange: (value: MessageComposerValue) => void;
  aiPrompt: string;
  onAiPromptChange: (v: string) => void;
}

export function StepMessage({
  campaignUuid,
  campaignType,
  channels,
  value,
  onChange,
  aiPrompt,
  onAiPromptChange,
}: StepMessageProps) {
  const aiGenerate = useCampaignAiGenerate();
  const defaultChannel = channels[0] ?? Channel.EMAIL;
  const [activeChannel, setActiveChannel] = useState<Channel>(defaultChannel);
  const [composerKey, setComposerKey] = useState(0);

  useEffect(() => {
    if (!channels.includes(activeChannel)) {
      setActiveChannel(channels[0] ?? Channel.EMAIL);
    }
  }, [channels, activeChannel]);

  const handleAi = async (args: { channel: Channel; action: any; prompt: string; language: string; currentSubject?: string; currentContent?: string }) => {
    const result = await aiGenerate.mutateAsync({
      uuid: campaignUuid,
      payload: {
        channel: args.channel,
        action: args.action,
        prompt: args.prompt || undefined,
        language: args.language,
        current_subject: args.currentSubject,
        current_content: args.currentContent,
      },
    });
    return { subject: result.subject, content: result.content };
  };

  const composerChannels = useMemo(
    () => channels.filter((c) => c === Channel.EMAIL || c === Channel.SMS || c === Channel.LINKEDIN),
    [channels],
  );

  const handleTemplateSelect = (template: MessageTemplate) => {
    onChange(mergeTemplateIntoComposer(value, template));
    const nextChannel = preferredChannelAfterTemplateApply(template);
    if (nextChannel && composerChannels.includes(nextChannel)) {
      setActiveChannel(nextChannel);
    }
    setComposerKey((k) => k + 1);
  };

  if (campaignType === CampaignType.PERSONALIZED) {
    return (
      <PersonalizedMessageGoalField value={aiPrompt} onChange={onAiPromptChange} />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted max-w-2xl">The AI panel helps draft, improve, shorten, or change tone — the output goes straight into the editor below for you to tweak before sending.</p>
      <MessageTemplateSelect
        allowedChannels={composerChannels}
        onSelect={handleTemplateSelect}
      />
      <MessageComposer
        key={composerKey}
        channels={composerChannels}
        activeChannel={activeChannel}
        onActiveChannelChange={setActiveChannel}
        value={value}
        onChange={(patch) => onChange({ ...value, ...patch })}
        onAiGenerate={handleAi}
        aiActions={DEFAULT_CAMPAIGN_ACTIONS}
        isAiPending={aiGenerate.isPending}
      />
    </div>
  );
}
