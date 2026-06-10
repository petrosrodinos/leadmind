import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { NotificationsGateway } from '@/gateways/notifications.gateway';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ListFormsDto } from './dto/list-forms.dto';

@Injectable()
export class FormsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: NotificationsGateway,
    ) {}

    async create(user_uuid: string, dto: CreateFormDto) {
        const form = await this.prisma.form.create({
            data: {
                user_uuid,
                name: dto.name,
                description: dto.description,
            },
            include: {
                _count: { select: { completions: true, fields: true } },
            },
        });

        this.gateway.emitToUser(user_uuid, 'form.created', form);
        return form;
    }

    async findAll(user_uuid: string, query: ListFormsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: any = { user_uuid };

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.form.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    _count: { select: { completions: true, fields: true } },
                },
            }),
            this.prisma.form.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(user_uuid: string, uuid: string) {
        const form = await this.prisma.form.findFirst({
            where: { uuid, user_uuid },
            include: {
                fields: { orderBy: { order_index: 'asc' } },
                _count: { select: { completions: true } },
            },
        });

        if (!form) throw new NotFoundException('Form not found');
        return form;
    }

    async update(user_uuid: string, uuid: string, dto: UpdateFormDto) {
        const form = await this.prisma.form.findFirst({ where: { uuid, user_uuid } });
        if (!form) throw new NotFoundException('Form not found');

        const updated = await this.prisma.form.update({
            where: { uuid },
            data: dto,
            include: {
                _count: { select: { completions: true, fields: true } },
            },
        });

        this.gateway.emitToUser(user_uuid, 'form.updated', updated);
        return updated;
    }

    async remove(user_uuid: string, uuid: string) {
        const form = await this.prisma.form.findFirst({ where: { uuid, user_uuid } });
        if (!form) throw new NotFoundException('Form not found');

        await this.prisma.form.delete({ where: { uuid } });
        this.gateway.emitToUser(user_uuid, 'form.deleted', { uuid });
        return { uuid };
    }

    async duplicate(user_uuid: string, uuid: string) {
        const form = await this.prisma.form.findFirst({
            where: { uuid, user_uuid },
            include: { fields: { orderBy: { order_index: 'asc' } } },
        });
        if (!form) throw new NotFoundException('Form not found');

        const newForm = await this.prisma.$transaction(async (tx) => {
            const created = await tx.form.create({
                data: {
                    user_uuid,
                    name: `Copy of ${form.name}`,
                    description: form.description,
                },
            });

            if (form.fields.length > 0) {
                await tx.formField.createMany({
                    data: form.fields.map((f) => ({
                        form_uuid: created.uuid,
                        label: f.label,
                        field_type: f.field_type,
                        placeholder: f.placeholder,
                        help_text: f.help_text,
                        required: f.required,
                        default_value: f.default_value,
                        options: f.options ?? undefined,
                        order_index: f.order_index,
                        enabled: f.enabled,
                    })),
                });
            }

            return tx.form.findFirst({
                where: { uuid: created.uuid },
                include: { _count: { select: { completions: true, fields: true } } },
            });
        });

        this.gateway.emitToUser(user_uuid, 'form.created', newForm);
        return newForm;
    }
}
