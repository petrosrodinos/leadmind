export interface LinkedInCompanyQueryConfig {
    company_urls?: string[];
    searches?: string[];
}

export interface LinkedInCompanyHeadquarters {
    city?: string;
    country?: string;
    geographicArea?: string;
    line1?: string;
    line2?: string;
    postalCode?: string;
    [key: string]: any;
}

export interface LinkedInCompanyLocation {
    city?: string;
    country?: string;
    geographicArea?: string;
    line1?: string;
    line2?: string;
    postalCode?: string;
    headquarter?: boolean;
    [key: string]: any;
}

export interface LinkedInCompanyRawItem {
    url?: string;
    universalName?: string;
    username?: string;
    name?: string;
    companyName?: string;
    description?: string;
    about?: string;
    tagline?: string;
    website?: string;
    industry?: string;
    industries?: string[];
    companySize?: string;
    employeeCount?: number;
    employeeCountRange?: string;
    followerCount?: number;
    specialties?: string[];
    headquarters?: LinkedInCompanyHeadquarters;
    locations?: LinkedInCompanyLocation[];
    foundedYear?: number;
    founded?: string;
    companyType?: string;
    type?: string;
    logoUrl?: string;
    logo?: string;
    coverImageUrl?: string;
    coverImage?: string;
    phone?: string;
    email?: string;
    crunchbaseFundingData?: Record<string, any>;
    [key: string]: any;
}

export interface NormalizedCompany {
    name?: string;
    linkedin_url?: string;
    linkedin_username?: string;
    website?: string;
    description?: string;
    tagline?: string;
    industry?: string;
    industries?: string[];
    specialties?: string[];
    company_size?: string;
    employee_count?: number;
    follower_count?: number;
    founded_year?: number;
    company_type?: string;
    headquarters?: string;
    locations?: string[];
    logo_url?: string;
    cover_image_url?: string;
    phone?: string;
    email?: string;
    raw_data: Record<string, any>;
}
