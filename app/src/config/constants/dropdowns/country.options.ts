const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

export const CountryOptions = [
    { label: "Austria", value: "AT", phone_code: "+43", icon: getCountryFlag("AT"), language_label: "German", language_value: "de" },
    { label: "Belgium", value: "BE", phone_code: "+32", icon: getCountryFlag("BE"), language_label: "Dutch", language_value: "nl" },
    { label: "Bulgaria", value: "BG", phone_code: "+359", icon: getCountryFlag("BG"), language_label: "Bulgarian", language_value: "bg" },
    { label: "Croatia", value: "HR", phone_code: "+385", icon: getCountryFlag("HR"), language_label: "Croatian", language_value: "hr" },
    { label: "Cyprus", value: "CY", phone_code: "+357", icon: getCountryFlag("CY"), language_label: "Greek", language_value: "el" },
    { label: "Czech Republic", value: "CZ", phone_code: "+420", icon: getCountryFlag("CZ"), language_label: "Czech", language_value: "cs" },
    { label: "Denmark", value: "DK", phone_code: "+45", icon: getCountryFlag("DK"), language_label: "Danish", language_value: "da" },
    { label: "Estonia", value: "EE", phone_code: "+372", icon: getCountryFlag("EE"), language_label: "Estonian", language_value: "et" },
    { label: "Finland", value: "FI", phone_code: "+358", icon: getCountryFlag("FI"), language_label: "Finnish", language_value: "fi" },
    { label: "France", value: "FR", phone_code: "+33", icon: getCountryFlag("FR"), language_label: "French", language_value: "fr" },
    { label: "Germany", value: "DE", phone_code: "+49", icon: getCountryFlag("DE"), language_label: "German", language_value: "de" },
    { label: "Greece", value: "GR", phone_code: "+30", icon: getCountryFlag("GR"), language_label: "Greek", language_value: "el" },
    { label: "Hungary", value: "HU", phone_code: "+36", icon: getCountryFlag("HU"), language_label: "Hungarian", language_value: "hu" },
    { label: "Ireland", value: "IE", phone_code: "+353", icon: getCountryFlag("IE"), language_label: "English", language_value: "en" },
    { label: "Italy", value: "IT", phone_code: "+39", icon: getCountryFlag("IT"), language_label: "Italian", language_value: "it" },
    { label: "Latvia", value: "LV", phone_code: "+371", icon: getCountryFlag("LV"), language_label: "Latvian", language_value: "lv" },
    { label: "Lithuania", value: "LT", phone_code: "+370", icon: getCountryFlag("LT"), language_label: "Lithuanian", language_value: "lt" },
    { label: "Luxembourg", value: "LU", phone_code: "+352", icon: getCountryFlag("LU"), language_label: "French", language_value: "fr" },
    { label: "Malta", value: "MT", phone_code: "+356", icon: getCountryFlag("MT"), language_label: "Maltese", language_value: "mt" },
    { label: "Netherlands", value: "NL", phone_code: "+31", icon: getCountryFlag("NL"), language_label: "Dutch", language_value: "nl" },
    { label: "Poland", value: "PL", phone_code: "+48", icon: getCountryFlag("PL"), language_label: "Polish", language_value: "pl" },
    { label: "Portugal", value: "PT", phone_code: "+351", icon: getCountryFlag("PT"), language_label: "Portuguese", language_value: "pt" },
    { label: "Romania", value: "RO", phone_code: "+40", icon: getCountryFlag("RO"), language_label: "Romanian", language_value: "ro" },
    { label: "Slovakia", value: "SK", phone_code: "+421", icon: getCountryFlag("SK"), language_label: "Slovak", language_value: "sk" },
    { label: "Slovenia", value: "SI", phone_code: "+386", icon: getCountryFlag("SI"), language_label: "Slovenian", language_value: "sl" },
    { label: "Spain", value: "ES", phone_code: "+34", icon: getCountryFlag("ES"), language_label: "Spanish", language_value: "es" },
    { label: "Sweden", value: "SE", phone_code: "+46", icon: getCountryFlag("SE"), language_label: "Swedish", language_value: "sv" },
];