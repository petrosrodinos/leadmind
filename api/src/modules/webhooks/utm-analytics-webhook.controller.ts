import {
    Body,
    Controller,
    HttpCode,
    Logger,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UtmAnalyticsWebhookDto } from './dto/utm-analytics-webhook.dto';
import { CampaignUtmAnalyticsService } from './services/campaign-utm-analytics.service';

@ApiTags('webhooks')
@Controller('webhooks/utm-analytics')
export class UtmAnalyticsWebhookController {
    private readonly logger = new Logger(UtmAnalyticsWebhookController.name);

    constructor(private readonly campaignUtmAnalyticsService: CampaignUtmAnalyticsService) { }

    @Post()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Record website or booking page visits tagged with campaign UTM parameters',
    })
    async handle(@Body() body: UtmAnalyticsWebhookDto): Promise<{ ok: true; matched: boolean; campaign_uuid?: string }> {
        try {
            return await this.campaignUtmAnalyticsService.ingest(body);
        } catch (error) {
            this.logger.error(
                `Failed processing UTM analytics: ${error instanceof Error ? error.message : error}`,
            );
            return { ok: true, matched: false };
        }
    }
}
