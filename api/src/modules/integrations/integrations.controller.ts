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
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationCredentialDto } from './dto/create-integration-credential.dto';
import { UpdateIntegrationCredentialDto } from './dto/update-integration-credential.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) {}

    @Get()
    @ApiOperation({ summary: 'List integration providers and stored credentials' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.integrationsService.findAll(user_uuid);
    }

    @Post('credentials')
    @ApiOperation({ summary: 'Store a credential for an integration provider' })
    createCredential(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: CreateIntegrationCredentialDto,
    ) {
        return this.integrationsService.createCredential(user_uuid, dto);
    }

    @Patch('credentials/:uuid')
    @ApiOperation({ summary: 'Update a stored credential secret' })
    @ApiResponse({ status: 404, description: 'Credential not found' })
    updateCredential(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateIntegrationCredentialDto,
    ) {
        return this.integrationsService.updateCredential(user_uuid, uuid, dto);
    }

    @Delete('credentials/:uuid')
    @ApiOperation({ summary: 'Delete a stored credential' })
    @ApiResponse({ status: 404, description: 'Credential not found' })
    removeCredential(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.integrationsService.removeCredential(user_uuid, uuid);
    }
}
