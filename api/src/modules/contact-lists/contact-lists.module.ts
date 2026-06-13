import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { MarketingCampaignsModule } from '@/modules/marketing-campaigns/marketing-campaigns.module';
import { ContactAudienceStatsModule } from '@/modules/contact-audience-stats/contact-audience-stats.module';
import { ContactListsController } from './contact-lists.controller';
import { ContactListsService } from './contact-lists.service';

@Module({
    imports: [PrismaModule, ContactsModule, MarketingCampaignsModule, ContactAudienceStatsModule],
    controllers: [ContactListsController],
    providers: [ContactListsService],
    exports: [ContactListsService],
})
export class ContactListsModule {}
