import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { ReorderFormFieldsDto } from './dto/reorder-form-fields.dto';

@Injectable()
export class FormFieldsService {
    constructor(private readonly prisma: PrismaService) {}

    private async assertFormOwnership(user_uuid: string, form_uuid: string) {
        const form = await this.prisma.form.findFirst({ where: { uuid: form_uuid, user_uuid } });
        if (!form) throw new NotFoundException('Form not found');
        return form;
    }

    async create(user_uuid: string, form_uuid: string, dto: CreateFormFieldDto) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        let order_index = dto.order_index;
        if (order_index === undefined) {
            const last = await this.prisma.formField.findFirst({
                where: { form_uuid },
                orderBy: { order_index: 'desc' },
                select: { order_index: true },
            });
            order_index = last ? last.order_index + 10 : 0;
        }

        return this.prisma.formField.create({
            data: {
                form_uuid,
                label: dto.label,
                field_type: dto.field_type,
                placeholder: dto.placeholder,
                help_text: dto.help_text,
                required: dto.required ?? false,
                default_value: dto.default_value,
                options: dto.options ?? undefined,
                order_index,
                enabled: dto.enabled ?? true,
            },
        });
    }

    async update(user_uuid: string, form_uuid: string, field_uuid: string, dto: UpdateFormFieldDto) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const field = await this.prisma.formField.findFirst({ where: { uuid: field_uuid, form_uuid } });
        if (!field) throw new NotFoundException('Field not found');

        return this.prisma.formField.update({
            where: { uuid: field_uuid },
            data: {
                ...dto,
                options: dto.options !== undefined ? dto.options : undefined,
            },
        });
    }

    async remove(user_uuid: string, form_uuid: string, field_uuid: string) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const field = await this.prisma.formField.findFirst({ where: { uuid: field_uuid, form_uuid } });
        if (!field) throw new NotFoundException('Field not found');

        await this.prisma.formField.delete({ where: { uuid: field_uuid } });
        return { uuid: field_uuid };
    }

    async reorder(user_uuid: string, form_uuid: string, dto: ReorderFormFieldsDto) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        await this.prisma.$transaction(
            dto.fields.map((item) =>
                this.prisma.formField.update({
                    where: { uuid: item.uuid, form_uuid },
                    data: { order_index: item.order_index },
                }),
            ),
        );

        return this.prisma.formField.findMany({
            where: { form_uuid },
            orderBy: { order_index: 'asc' },
        });
    }
}
