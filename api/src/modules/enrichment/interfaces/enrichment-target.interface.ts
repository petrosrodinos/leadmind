export type EnrichmentTargetKind = 'lead' | 'contact';

export type EnrichmentTarget = {
    kind: EnrichmentTargetKind;
    uuid: string;
};

export type EnrichmentHistoryTarget = EnrichmentTarget;
