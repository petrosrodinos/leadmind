import { useEffect, useMemo } from "react";
import { useState } from "react";
import { Label, TextArea, TextField } from "@heroui/react";
import { MessageComposer, type MessageComposerValue } from "@/features/messaging/components/message-composer";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { CampaignType } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { useCampaignAiGenerate } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";

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

  const composerChannels = useMemo(() => channels.filter((c) => c === Channel.EMAIL || c === Channel.SMS), [channels]);

  if (campaignType === CampaignType.PERSONALIZED) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <p className="text-sm text-muted">
          Describe the goal of your outreach. The AI will write a unique message for each contact based on their profile and this prompt.
        </p>
        <TextField name="ai_prompt">
          <Label>Message goal</Label>
          <TextArea
            rows={5}
            placeholder="e.g. Introduce our new pricing plan, highlight the cost savings for their industry, keep it brief and friendly…"
            value={aiPrompt}
            onChange={(e) => onAiPromptChange(e.target.value)}
            maxLength={2000}
          />
          <p className="text-xs text-muted mt-1">{aiPrompt.length}/2000</p>
        </TextField>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted max-w-2xl">The AI panel helps draft, improve, shorten, or change tone — the output goes straight into the editor below for you to tweak before sending.</p>
      <MessageComposer channels={composerChannels} activeChannel={activeChannel} onActiveChannelChange={setActiveChannel} value={value} onChange={(patch) => onChange({ ...value, ...patch })} onAiGenerate={handleAi} aiActions={DEFAULT_CAMPAIGN_ACTIONS} isAiPending={aiGenerate.isPending} />
    </div>
  );
}
