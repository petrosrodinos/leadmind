import { z } from "zod";

export const scoringInstructionFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    instructions: z.string().min(1, "Instructions are required").max(20000),
});

export type ScoringInstructionFormValues = z.infer<typeof scoringInstructionFormSchema>;
