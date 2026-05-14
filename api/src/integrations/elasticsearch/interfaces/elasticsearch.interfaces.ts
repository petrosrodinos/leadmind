import { LeadStatus } from '@/generated/prisma';
import { ContactScoreRuleItemDto } from '@/modules/scoring-instructions/dto/contact-score-rule.dto';

export interface SearchQuery {
    q?: string;
    status?: LeadStatus;
    score_rules?: ContactScoreRuleItemDto[];
    source_type?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}

export interface SearchResult<T = any> {
    hits: T[];
    total: number;
}
