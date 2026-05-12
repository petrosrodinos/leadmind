export interface LinkedInProfileQueryConfig {
    profile_urls: string[];
}

export interface LinkedInProfileExperience {
    title?: string;
    company?: string;
    companyUrl?: string;
    companyLogo?: string;
    location?: string;
    employmentType?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    [key: string]: any;
}

export interface LinkedInProfileEducation {
    school?: string;
    schoolUrl?: string;
    schoolLogo?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    [key: string]: any;
}

export interface LinkedInProfileProject {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    contributors?: string[];
    [key: string]: any;
}

export interface LinkedInProfileRecommendation {
    author?: string;
    authorUrl?: string;
    relationship?: string;
    text?: string;
    date?: string;
    [key: string]: any;
}

export interface LinkedInProfileSimilar {
    name?: string;
    url?: string;
    headline?: string;
    image?: string;
    [key: string]: any;
}

export interface LinkedInProfileActivity {
    title?: string;
    url?: string;
    type?: string;
    date?: string;
    [key: string]: any;
}

export interface LinkedInProfilePost {
    text?: string;
    url?: string;
    date?: string;
    likes?: number;
    comments?: number;
    [key: string]: any;
}

export interface LinkedInProfileArticle {
    title?: string;
    url?: string;
    date?: string;
    [key: string]: any;
}

export interface LinkedInProfilePublication {
    title?: string;
    publisher?: string;
    date?: string;
    url?: string;
    description?: string;
    [key: string]: any;
}

export interface LinkedInProfileRawItem {
    success?: boolean;
    error?: string;
    url?: string;
    name?: string;
    headline?: string;
    image?: string;
    avatar?: string;
    coverImage?: string;
    location?: string;
    followers?: number;
    connections?: string | number;
    about?: string;
    summary?: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    publicIdentifier?: string;
    username?: string;
    locale?: string;
    language?: string;
    recentPosts?: LinkedInProfilePost[];
    experience?: LinkedInProfileExperience[];
    articles?: LinkedInProfileArticle[];
    activity?: LinkedInProfileActivity[];
    education?: LinkedInProfileEducation[];
    publications?: LinkedInProfilePublication[];
    projects?: LinkedInProfileProject[];
    recommendations?: LinkedInProfileRecommendation[];
    similarProfiles?: LinkedInProfileSimilar[];
    skills?: string[];
    certifications?: any[];
    [key: string]: any;
}

export interface NormalizedProfile {
    name?: string;
    first_name?: string;
    last_name?: string;
    headline?: string;
    title?: string;
    company?: string;
    company_linkedin_url?: string;
    linkedin_url?: string;
    linkedin_username?: string;
    location?: string;
    industry?: string;
    about?: string;
    image_url?: string;
    cover_image_url?: string;
    followers?: number;
    connections?: number;
    email?: string;
    phone?: string;
    website?: string;
    locale?: string;
    experience?: LinkedInProfileExperience[];
    education?: LinkedInProfileEducation[];
    projects?: LinkedInProfileProject[];
    recommendations?: LinkedInProfileRecommendation[];
    similar_profiles?: LinkedInProfileSimilar[];
    recent_posts?: LinkedInProfilePost[];
    articles?: LinkedInProfileArticle[];
    activity?: LinkedInProfileActivity[];
    publications?: LinkedInProfilePublication[];
    skills?: string[];
    success: boolean;
    error?: string;
    raw_data: Record<string, any>;
}
