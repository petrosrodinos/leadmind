import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ExternalIntegrationProvider } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationKeyDto } from './dto/create-integration-key.dto';
import { UpdateIntegrationKeyDto } from './dto/update-integration-key.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) {}

    @Get()
    @ApiOperation({ summary: 'List integrations and keys for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.integrationsService.findAll(user_uuid);
    }

    @Post(':provider/keys')
    @ApiOperation({ summary: 'Add a key for a provider integration' })
    @ApiParam({ name: 'provider', enum: ExternalIntegrationProvider })
    createKey(
        @CurrentUser('uuid') user_uuid: string,
        @Param('provider') provider: ExternalIntegrationProvider,
        @Body() dto: CreateIntegrationKeyDto,
    ) {
        return this.integrationsService.createKey(user_uuid, provider, dto);
    }

    @Patch('keys/:uuid')
    @ApiOperation({ summary: 'Update an integration key' })
    @ApiResponse({ status: 404, description: 'Key not found' })
    updateKey(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateIntegrationKeyDto,
    ) {
        return this.integrationsService.updateKey(user_uuid, uuid, dto);
    }

    @Delete('keys/:uuid')
    @ApiOperation({ summary: 'Delete an integration key' })
    @ApiResponse({ status: 404, description: 'Key not found' })
    removeKey(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.integrationsService.removeKey(user_uuid, uuid);
    }
}
