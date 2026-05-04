import { CountryOptions } from "@/config/constants/dropdowns/country.options";

const countryNameToCodeMap = new Map<string, string>();

CountryOptions.forEach((option) => {
    countryNameToCodeMap.set(option.label.toLowerCase(), option.value);
});

export const getCountryCodeFromName = (countryName: string): string => {
    if (!countryName) return "";

    const isCountryCode = CountryOptions.some((option) => option.value === countryName);
    if (isCountryCode) {
        return countryName;
    }
    const normalizedName = countryName.toLowerCase().trim();
    return countryNameToCodeMap.get(normalizedName) || countryName;
};

export const getCountryNameFromCode = (countryCode: string): string => {
    const option = CountryOptions.find((opt) => opt.value === countryCode);
    return option?.label || countryCode;
};
