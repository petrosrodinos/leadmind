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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ScoringInstructionsService } from './scoring-instructions.service';
import { CreateScoringInstructionDto } from './dto/create-scoring-instruction.dto';
import { UpdateScoringInstructionDto } from './dto/update-scoring-instruction.dto';

@ApiTags('scoring-instructions')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('scoring-instructions')
export class ScoringInstructionsController {
    constructor(private readonly scoringInstructionsService: ScoringInstructionsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a scoring instruction' })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateScoringInstructionDto) {
        return this.scoringInstructionsService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List scoring instructions for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.scoringInstructionsService.findAll(user_uuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a scoring instruction by uuid' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.scoringInstructionsService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update a scoring instruction' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateScoringInstructionDto,
    ) {
        return this.scoringInstructionsService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a scoring instruction' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.scoringInstructionsService.remove(user_uuid, uuid);
    }
}
