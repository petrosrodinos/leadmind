import { NormalizedLead } from '@/integrations/apify/interfaces/apify.interfaces';

export interface GemiQueryConfig {
    name?: string;
    activities?: string[];
    legalTypes?: number[];
    municipalities?: string[];
    prefectures?: number[];
    statuses?: number[];
    isActive?: boolean;
    maxLeads?: number;
}

export interface GemiCodedValue {
    id: number | string;
    descr: string;
}

export interface GemiCompanyPerson {
    personName?: string;
    businessName?: string;
    role?: string;
    dtFrom?: string;
    dtTo?: string;
    isRepresentativeAlone?: boolean;
    isRepresentativeInCommon?: boolean;
    percentage?: string;
    category?: string;
}

export interface GemiCompanyActivity {
    activity?: {
        id: string;
        descr: string;
        kadVersion?: string;
    };
    type?: string;
    dtFrom?: string;
    dtTo?: string;
}

export interface GemiCapitalEntry {
    capitalStock?: number;
    currency?: string;
    ecsokefalaiikes?: number;
    eggiitikes?: number;
}

export interface GemiStockEntry {
    stockTypeId?: number;
    amount?: number;
    nominalPrice?: number;
    stockType?: string;
}

export interface GemiCompany {
    arGemi?: number;
    afm?: string;
    coNameEl?: string;
    coNamesEn?: string[];
    coTitlesEl?: string[];
    coTitlesEn?: string[];
    municipality?: GemiCodedValue;
    prefecture?: GemiCodedValue;
    city?: string;
    street?: string;
    streetNumber?: string;
    zipCode?: string;
    poBox?: string;
    url?: string;
    email?: string;
    isBranch?: boolean;
    objective?: string;
    legalType?: GemiCodedValue;
    gemiOffice?: GemiCodedValue;
    assemblySubjects?: GemiCodedValue;
    incorporationDate?: string;
    lastStatusChange?: string;
    status?: GemiCodedValue;
    autoRegistered?: boolean;
    activities?: GemiCompanyActivity[];
    persons?: GemiCompanyPerson[];
    capital?: GemiCapitalEntry[];
    stocks?: GemiStockEntry[];
    branch?: number[];
}

export interface GemiSearchResponse {
    searchMetadata: {
        totalCount: number;
        resultsOffset: number;
        resultsSize: string;
    };
    searchResults: GemiCompany[];
}

export interface GemiCompanyDocumentDecision {
    dateAssemblyDecided?: string;
    assembly?: string;
    summary?: string;
    kak?: string;
    decisionSubject?: string;
    decisionSubjectID?: string;
    dateAnnounced?: string;
    assemblyDecisionUrl?: string;
    dateRegistrated?: string;
    applicationStatusId?: string;
    applicationStatusDescription?: string;
    referenceKak?: string;
}

export interface GemiCompanyDocumentPublication {
    url?: string;
    kad?: string;
}

export interface GemiCompanyDocumentSet {
    decision?: GemiCompanyDocumentDecision[];
    publication?: GemiCompanyDocumentPublication[];
}

export interface GemiActivity {
    id: string;
    descr: string;
    descrEn?: string;
    lastUpdated?: string;
    kadVersion?: string;
}

export interface GemiCompanyStatus {
    id: number;
    descr: string;
    descrEn?: string;
    isActive?: boolean;
    lastUpdated?: string;
}

export interface GemiLegalType {
    id: number;
    descr: string;
    descrEn?: string;
    lastUpdated?: string;
}

export interface GemiOffice {
    id: number;
    descr: string;
    descrEn?: string;
    lastUpdated?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    phone?: string;
    fax?: string;
    url?: string;
}

export interface GemiMunicipality {
    id: string;
    prefectureId?: string;
    descr: string;
    descrEn?: string;
    lastUpdated?: string;
}

export interface GemiPrefecture {
    id: string;
    descr: string;
    descrEn?: string;
    lastUpdated?: string;
}

export interface GemiAssemblySubject {
    id: string;
    descr: string;
    descrEn?: string;
    lastUpdated?: string;
}

export { NormalizedLead };
