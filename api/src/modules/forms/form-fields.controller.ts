import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { FormFieldsService } from './form-fields.service';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { ReorderFormFieldsDto } from './dto/reorder-form-fields.dto';

@ApiTags('forms')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('forms/:uuid/fields')
export class FormFieldsController {
    constructor(private readonly formFieldsService: FormFieldsService) {}

    @Post()
    @ApiOperation({ summary: 'Add a field to a form' })
    create(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Body() dto: CreateFormFieldDto,
    ) {
        return this.formFieldsService.create(user_uuid, form_uuid, dto);
    }

    // IMPORTANT: /reorder must be declared before /:fieldUuid to prevent NestJS from matching "reorder" as a UUID param
    @Put('reorder')
    @ApiOperation({ summary: 'Reorder fields in a form' })
    reorder(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Body() dto: ReorderFormFieldsDto,
    ) {
        return this.formFieldsService.reorder(user_uuid, form_uuid, dto);
    }

    @Put(':fieldUuid')
    @ApiOperation({ summary: 'Update a form field' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Param('fieldUuid') field_uuid: string,
        @Body() dto: UpdateFormFieldDto,
    ) {
        return this.formFieldsService.update(user_uuid, form_uuid, field_uuid, dto);
    }

    @Delete(':fieldUuid')
    @ApiOperation({ summary: 'Delete a form field' })
    remove(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') form_uuid: string,
        @Param('fieldUuid') field_uuid: string,
    ) {
        return this.formFieldsService.remove(user_uuid, form_uuid, field_uuid);
    }
}
