import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ExternalIntegrationProvider } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationKeyDto } from './dto/create-integration-key.dto';
import { CreateSmtpAccountDto } from './dto/create-smtp-account.dto';
import { SetDefaultIntegrationAccountDto } from './dto/set-default-integration-account.dto';
import { UpdateIntegrationKeyDto } from './dto/update-integration-key.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) {}

    @Get()
    @ApiOperation({ summary: 'List integration providers and stored keys' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.integrationsService.findAll(user_uuid);
    }

    @Post(':provider/keys')
    @ApiOperation({ summary: 'Store a key for an integration provider' })
    createKey(
        @CurrentUser('uuid') user_uuid: string,
        @Param('provider', new ParseEnumPipe(ExternalIntegrationProvider))
        provider: ExternalIntegrationProvider,
        @Body() dto: CreateIntegrationKeyDto,
    ) {
        return this.integrationsService.createKey(user_uuid, provider, dto);
    }

    @Post('SMTP/accounts')
    @ApiOperation({ summary: 'Create a complete SMTP account in one request' })
    createSmtpAccount(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: CreateSmtpAccountDto,
    ) {
        return this.integrationsService.createSmtpAccount(user_uuid, dto);
    }

    @Patch('keys/:uuid')
    @ApiOperation({ summary: 'Update a stored key secret' })
    @ApiResponse({ status: 404, description: 'Key not found' })
    updateKey(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateIntegrationKeyDto,
    ) {
        return this.integrationsService.updateKey(user_uuid, uuid, dto);
    }

    @Patch(':provider/default-account')
    @ApiOperation({ summary: 'Set the default account for a multi-account integration' })
    @ApiResponse({ status: 404, description: 'Integration not found' })
    setDefaultAccount(
        @CurrentUser('uuid') user_uuid: string,
        @Param('provider', new ParseEnumPipe(ExternalIntegrationProvider))
        provider: ExternalIntegrationProvider,
        @Body() dto: SetDefaultIntegrationAccountDto,
    ) {
        return this.integrationsService.setDefaultAccount(user_uuid, provider, dto);
    }

    @Delete('keys/:uuid')
    @ApiOperation({ summary: 'Delete a stored key' })
    @ApiResponse({ status: 404, description: 'Key not found' })
    removeKey(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.integrationsService.removeKey(user_uuid, uuid);
    }
}

