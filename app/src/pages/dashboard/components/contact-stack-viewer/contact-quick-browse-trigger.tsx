import type { FC } from "react";
import { Button } from "@heroui/react";
import { ChevronsUpDown } from "lucide-react";

interface ContactQuickBrowseTriggerProps {
    onPress: () => void;
    isDisabled?: boolean;
}

export const ContactQuickBrowseTrigger: FC<ContactQuickBrowseTriggerProps> = ({
    onPress,
    isDisabled = false,
}) => (
    <Button size="sm" variant="secondary" isDisabled={isDisabled} onPress={onPress}>
        <ChevronsUpDown className="size-4" />
        Quick browse
    </Button>
);
