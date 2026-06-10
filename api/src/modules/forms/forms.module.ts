import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { GatewaysModule } from '@/gateways/gateways.module';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormFieldsController } from './form-fields.controller';
import { FormFieldsService } from './form-fields.service';
import {
    FormCompletionsController,
    FormCompletionsByContactController,
} from './form-completions.controller';
import { FormCompletionsService } from './form-completions.service';

@Module({
    imports: [PrismaModule, GatewaysModule],
    controllers: [
        FormsController,
        FormFieldsController,
        FormCompletionsController,
        FormCompletionsByContactController,
    ],
    providers: [FormsService, FormFieldsService, FormCompletionsService],
    exports: [FormsService],
})
export class FormsModule {}
