import { Global, Logger, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ELASTICSEARCH_CLIENT } from './elasticsearch.constants';
import { ElasticsearchService } from './elasticsearch.service';

const elasticsearchClientProvider: Provider = {
    provide: ELASTICSEARCH_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): Client | null => {
        const url = configService.get<string>('ELASTICSEARCH_URL');
        const logger = new Logger('ElasticsearchModule');
        if (!url) {
            logger.warn('ELASTICSEARCH_URL not set — Elasticsearch features disabled');
            return null;
        }
        return new Client({ node: url });
    },
};

@Global()
@Module({
    imports: [ConfigModule, AiIntegrationModule],
    providers: [elasticsearchClientProvider, ElasticsearchService],
    exports: [ELASTICSEARCH_CLIENT, ElasticsearchService],
})
export class ElasticsearchModule { }
