import { Label, TextArea, TextField } from "@heroui/react";

export const PERSONALIZED_MESSAGE_GOAL_DESCRIPTION =
    "Describe the goal of your outreach. The AI will write a unique message for each contact based on their profile and enrichment data.";

export interface PersonalizedMessageGoalFieldProps {
    value: string;
    onChange: (value: string) => void;
    description?: string;
    maxLength?: number;
    disabled?: boolean;
}

export function PersonalizedMessageGoalField({
    value,
    onChange,
    description = PERSONALIZED_MESSAGE_GOAL_DESCRIPTION,
    maxLength = 2000,
    disabled = false,
}: PersonalizedMessageGoalFieldProps) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">{description}</p>
            <TextField name="ai_prompt">
                <Label>Message goal</Label>
                <TextArea
                    rows={5}
                    placeholder="e.g. Introduce our new pricing plan, highlight the cost savings for their industry, keep it brief and friendly…"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    disabled={disabled}
                />
                <p className="text-xs text-muted mt-1">{value.length}/{maxLength}</p>
            </TextField>
        </div>
    );
}
