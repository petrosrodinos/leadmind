export interface LinkedInLeadsQueryConfig {
    keywords?: string[];
    seniority?: string[];
    departments?: string[];
    location?: string[];
    industries?: string[];
    company_size?: string[];
    company_location?: string[];
    limit?: number;
    only_with_email?: boolean;
}

export interface LinkedInLeadsRawItem {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string;
    email?: string;
    workEmail?: string;
    personalEmail?: string;
    phone?: string;
    phoneNumber?: string;
    title?: string;
    jobTitle?: string;
    company?: string;
    companyName?: string;
    companyDomain?: string;
    companyWebsite?: string;
    website?: string;
    linkedinUrl?: string;
    linkedinProfileUrl?: string;
    profileUrl?: string;
    location?: string;
    city?: string;
    state?: string;
    country?: string;
    industry?: string;
    headline?: string;
    summary?: string;
    [key: string]: any;
}
