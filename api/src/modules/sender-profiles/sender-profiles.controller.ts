import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
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
import { SenderProfilesService } from './sender-profiles.service';
import { CreateSenderProfileDto } from './dto/create-sender-profile.dto';
import { UpdateSenderProfileDto } from './dto/update-sender-profile.dto';

@ApiTags('sender-profiles')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('sender-profiles')
export class SenderProfilesController {
    constructor(private readonly senderProfilesService: SenderProfilesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a sender profile for the current user' })
    @ApiResponse({ status: 201 })
    create(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: CreateSenderProfileDto,
    ) {
        return this.senderProfilesService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List sender profiles for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.senderProfilesService.findAll(user_uuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a sender profile by uuid' })
    @ApiResponse({ status: 404, description: 'Sender profile not found' })
    findOne(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.senderProfilesService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update a sender profile' })
    @ApiResponse({ status: 404, description: 'Sender profile not found' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateSenderProfileDto,
    ) {
        return this.senderProfilesService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a sender profile' })
    @ApiResponse({ status: 404, description: 'Sender profile not found' })
    remove(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.senderProfilesService.remove(user_uuid, uuid);
    }
}
