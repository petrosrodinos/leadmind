import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ListFormsDto } from './dto/list-forms.dto';

@ApiTags('forms')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('forms')
export class FormsController {
    constructor(private readonly formsService: FormsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a form' })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateFormDto) {
        return this.formsService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List forms' })
    findAll(@CurrentUser('uuid') user_uuid: string, @Query() query: ListFormsDto) {
        return this.formsService.findAll(user_uuid, query);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a form with its fields' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.formsService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update a form' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateFormDto,
    ) {
        return this.formsService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a form' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.formsService.remove(user_uuid, uuid);
    }

    @Post(':uuid/duplicate')
    @ApiOperation({ summary: 'Duplicate a form with all its fields' })
    duplicate(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.formsService.duplicate(user_uuid, uuid);
    }
}
