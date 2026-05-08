export const BUSINESS_MODELS = ["Product", "Services", "Solutions"] as const;

export type BusinessModel = (typeof BUSINESS_MODELS)[number];
