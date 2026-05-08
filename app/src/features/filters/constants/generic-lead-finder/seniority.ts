export const SENIORITY_LEVELS = [
    "Founder",
    "Chairman",
    "President",
    "CEO",
    "CXO",
    "Vice President",
    "Director",
    "Head",
    "Manager",
    "Senior",
    "Junior",
    "Entry Level",
    "Executive",
] as const;

export type Seniority = (typeof SENIORITY_LEVELS)[number];
