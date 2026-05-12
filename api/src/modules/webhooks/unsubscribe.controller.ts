import {
    Controller,
    Get,
    Header,
    Logger,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InteractionType } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

@ApiTags('webhooks')
@Controller('unsubscribe')
export class UnsubscribeController {
    private readonly logger = new Logger(UnsubscribeController.name);

    constructor(private readonly prisma: PrismaService) { }

    @Get(':token')
    @Header('Content-Type', 'text/html; charset=utf-8')
    @ApiOperation({ summary: 'Public unsubscribe endpoint reached via email footer link' })
    async unsubscribe(@Param('token') token: string): Promise<string> {
        const contact = await this.prisma.contact.findUnique({
            where: { unsubscribe_token: token },
        });
        if (!contact) {
            throw new NotFoundException('Unsubscribe token not found');
        }

        if (!contact.unsubscribed_at) {
            await this.prisma.$transaction([
                this.prisma.contact.update({
                    where: { uuid: contact.uuid },
                    data: { unsubscribed_at: new Date() },
                }),
                this.prisma.interaction.create({
                    data: {
                        contact_uuid: contact.uuid,
                        user_uuid: contact.user_uuid,
                        type: InteractionType.UNSUBSCRIBED,
                        content: 'Contact clicked the unsubscribe link',
                    },
                }),
            ]);
            this.logger.log(`Contact ${contact.uuid} unsubscribed via token`);
        }

        return `<!doctype html>
<html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fafafa;margin:0">
  <div style="max-width:480px;padding:40px;text-align:center;background:#fff;border:1px solid #eee;border-radius:12px">
    <h1 style="margin:0 0 12px;font-size:20px">You're unsubscribed</h1>
    <p style="margin:0;color:#666;font-size:14px">We won't send marketing emails to <strong>${escapeHtml(
            contact.email ?? '',
        )}</strong> anymore.</p>
  </div>
</body></html>`;
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
