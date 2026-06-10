import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { FormCompletionsService } from './form-completions.service';
import { CreateFormCompletionDto } from './dto/create-form-completion.dto';
import { UpdateFormCompletionDto } from './dto/update-form-completion.dto';
import { ListFormCompletionsDto } from './dto/list-form-completions.dto';

@ApiTags('forms')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('forms/:uuid/completions')
export class FormCompletionsController {
    constructor(private readonly formCompletionsService: FormCompletionsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a form completion' })
    create(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Body() dto: CreateFormCompletionDto,
    ) {
        return this.formCompletionsService.create(user_uuid, form_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List completions for a form' })
    findAll(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Query() query: ListFormCompletionsDto,
    ) {
        return this.formCompletionsService.findAll(user_uuid, form_uuid, query);
    }

    @Get(':completionUuid')
    @ApiOperation({ summary: 'Get a single completion with all values' })
    findOne(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Param('completionUuid') completion_uuid: string,
    ) {
        return this.formCompletionsService.findOne(user_uuid, form_uuid, completion_uuid);
    }

    @Put(':completionUuid')
    @ApiOperation({ summary: 'Update completion values' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Param('completionUuid') completion_uuid: string,
        @Body() dto: UpdateFormCompletionDto,
    ) {
        return this.formCompletionsService.update(user_uuid, form_uuid, completion_uuid, dto);
    }

    @Delete(':completionUuid')
    @ApiOperation({ summary: 'Delete a form completion' })
    remove(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Param('completionUuid') completion_uuid: string,
    ) {
        return this.formCompletionsService.remove(user_uuid, form_uuid, completion_uuid);
    }
}

@ApiTags('form-completions')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('form-completions')
export class FormCompletionsByContactController {
    constructor(private readonly formCompletionsService: FormCompletionsService) {}

    @Get('contact/:contactUuid')
    @ApiOperation({ summary: 'Get all form completions for a contact (across all forms)' })
    findByContact(
        @CurrentUser('uuid') user_uuid: string,
        @Param('contactUuid') contact_uuid: string,
    ) {
        return this.formCompletionsService.findByContact(user_uuid, contact_uuid);
    }
}
