import { TimezoneOptions } from "@/config/constants/dropdowns/timezone.options";

export const getBrowserTimezone = (): string | undefined => {
  try {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matchingOption = TimezoneOptions.find((option) => option.value === browserTimezone);
    return matchingOption ? matchingOption.value : undefined;
  } catch {
    return undefined;
  }
};

