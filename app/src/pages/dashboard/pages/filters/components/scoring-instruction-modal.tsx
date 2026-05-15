import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FieldError, Form, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    useCreateScoringInstruction,
    useUpdateScoringInstruction,
} from "@/features/scoring-instructions/hooks/use-scoring-instructions";
import type { ScoringInstruction } from "@/features/scoring-instructions/interfaces/scoring-instruction.interface";
import {
    scoringInstructionFormSchema,
    type ScoringInstructionFormValues,
} from "@/features/scoring-instructions/validation-schemas/scoring-instruction.schema";

interface ScoringInstructionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: ScoringInstruction | null;
    onSaved?: () => void;
}

export const ScoringInstructionModal: FC<ScoringInstructionModalProps> = ({
    isOpen,
    onOpenChange,
    initial = null,
    onSaved,
}) => {
    const createMut = useCreateScoringInstruction();
    const updateMut = useUpdateScoringInstruction();
    const form = useForm<ScoringInstructionFormValues>({
        resolver: zodResolver(scoringInstructionFormSchema),
        defaultValues: { name: "", instructions: "" },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: initial?.name ?? "",
                instructions: initial?.instructions ?? "",
            });
        }
    }, [isOpen, initial, form]);

    const onSubmit = form.handleSubmit(async (vals) => {
        if (initial) {
            await updateMut.mutateAsync({ uuid: initial.uuid, payload: vals });
        } else {
            await createMut.mutateAsync(vals);
        }
        onSaved?.();
        onOpenChange(false);
    });

    const pending = createMut.isPending || updateMut.isPending;

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>
                            {initial ? "Edit scoring instruction" : "New scoring instruction"}
                        </Modal.Heading>
                    </Modal.Header>
                    <Form onSubmit={onSubmit} className="contents">
                        <Modal.Body className="p-6 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="si-name">Name</Label>
                                <Input
                                    id="si-name"
                                    placeholder="e.g. ICP fit, buying intent"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <FieldError>{form.formState.errors.name.message}</FieldError>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="si-instructions">Instructions</Label>
                                <TextArea
                                    id="si-instructions"
                                    rows={8}
                                    placeholder="How should the model score this contact from 1–10? Be specific about signals, roles, and disqualifiers."
                                    {...form.register("instructions")}
                                />
                                {form.formState.errors.instructions && (
                                    <FieldError>{form.formState.errors.instructions.message}</FieldError>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="gap-2 justify-end">
                            <Button
                                type="button"
                                size="sm"
                                variant="tertiary"
                                onPress={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <ActionButtonWithPending
                                type="submit"
                                size="sm"
                                isDisabled={pending}
                                isPending={pending}
                            >
                                {initial ? "Save" : "Create"}
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
