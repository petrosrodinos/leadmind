import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import { SearchResult } from '@/integrations/elasticsearch/interfaces/elasticsearch.interfaces';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    searchLeads(query: SearchDto): Promise<SearchResult> {
        return this.elasticsearchService.searchLeads(query);
    }

    searchContacts(userUuid: string, query: SearchDto): Promise<SearchResult> {
        return this.elasticsearchService.searchContacts(userUuid, query);
    }
}
