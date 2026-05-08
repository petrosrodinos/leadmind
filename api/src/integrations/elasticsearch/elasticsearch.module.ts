import { Global, Logger, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client, ClientOptions } from '@elastic/elasticsearch';
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

        const apiKey = configService.get<string>('ELASTICSEARCH_API_KEY');
        const username = configService.get<string>('ELASTICSEARCH_USERNAME');
        const password = configService.get<string>('ELASTICSEARCH_PASSWORD');

        const options: ClientOptions = { node: url };
        if (apiKey) {
            options.auth = { apiKey };
        } else if (username && password) {
            options.auth = { username, password };
        } else {
            logger.warn(
                'ELASTICSEARCH_URL set but no credentials provided (ELASTICSEARCH_API_KEY or ELASTICSEARCH_USERNAME/PASSWORD) — requests will be unauthenticated',
            );
        }

        return new Client(options);
    },
};

@Global()
@Module({
    imports: [ConfigModule, AiIntegrationModule],
    providers: [elasticsearchClientProvider, ElasticsearchService],
    exports: [ELASTICSEARCH_CLIENT, ElasticsearchService],
})
export class ElasticsearchModule { }
