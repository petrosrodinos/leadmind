export const COMPANY_SIZES = [
    "0 - 1",
    "2 - 10",
    "11 - 50",
    "51 - 200",
    "201 - 500",
    "501 - 1000",
    "1001 - 5000",
    "5001 - 10000",
    "10000+",
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number];
