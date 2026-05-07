export interface GenericLeadFinderQueryConfig {
    titles?: string[];
    seniority?: string[];
    departments?: string[];
    company_size?: string[];
    industries?: string[];
    industry_keywords?: string[];
    revenue?: string[];
    person_country?: string[];
    person_state?: string[];
    company_country?: string[];
    company_state?: string[];
    company_domains?: string[];
    business_model?: string[];
    first_name?: string;
    last_name?: string;
    limit?: number;
}

export interface GenericLeadFinderRawItem {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string;
    email?: string;
    personalEmail?: string;
    workEmail?: string;
    phone?: string;
    phoneNumber?: string;
    title?: string;
    jobTitle?: string;
    seniority?: string;
    company?: string;
    companyName?: string;
    organizationName?: string;
    companyDomain?: string;
    companyWebsite?: string;
    website?: string;
    linkedinUrl?: string;
    personLinkedinUrl?: string;
    companyLinkedinUrl?: string;
    location?: string;
    city?: string;
    state?: string;
    country?: string;
    industry?: string;
    [key: string]: any;
}
