export {
    EmailProviderSelect,
    isEmailProviderAllocationValid,
    type EmailProviderSelectProps,
} from "./email-provider-select";

import type { EmailProviderAllocation } from "@/features/integrations/interfaces/integrations.interface";
import { EmailProviderSelect } from "./email-provider-select";

export interface EmailProviderAllocationPickerProps {
    totalCount: number;
    value: EmailProviderAllocation[];
    onChange: (allocations: EmailProviderAllocation[]) => void;
    disabled?: boolean;
}

export function EmailProviderAllocationPicker({
    totalCount,
    value,
    onChange,
    disabled,
}: EmailProviderAllocationPickerProps) {
    return (
        <EmailProviderSelect
            totalCount={totalCount}
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
    );
}
