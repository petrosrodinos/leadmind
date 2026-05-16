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
    dtTo?: string | null;
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
    afm?: string;
    fax?: string | null;
    url?: string | null;
    city?: string;
    email?: string;
    phone?: string;
    poBox?: string | null;
    arGemi?: number | string;
    branch?: number[];
    status?: GemiCodedValue;
    stocks?: GemiStockEntry[];
    street?: string;
    capital?: GemiCapitalEntry[];
    persons?: GemiCompanyPerson[];
    zipCode?: string;
    coNameEl?: string;
    isBranch?: boolean;
    coNamesEn?: string[];
    legalType?: GemiCodedValue;
    objective?: string | null;
    activities?: GemiCompanyActivity[];
    coTitlesEl?: string[];
    coTitlesEn?: string[];
    gemiOffice?: GemiCodedValue;
    prefecture?: GemiCodedValue;
    municipality?: GemiCodedValue;
    streetNumber?: string;
    autoRegistered?: boolean;
    lastStatusChange?: string;
    incorporationDate?: string;
}
