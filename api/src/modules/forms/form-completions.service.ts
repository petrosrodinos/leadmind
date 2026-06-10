import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { NotificationsGateway } from '@/gateways/notifications.gateway';
import { CreateFormCompletionDto } from './dto/create-form-completion.dto';
import { UpdateFormCompletionDto } from './dto/update-form-completion.dto';
import { ListFormCompletionsDto } from './dto/list-form-completions.dto';

@Injectable()
export class FormCompletionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: NotificationsGateway,
    ) {}

    private async assertFormOwnership(user_uuid: string, form_uuid: string) {
        const form = await this.prisma.form.findFirst({ where: { uuid: form_uuid, user_uuid } });
        if (!form) throw new NotFoundException('Form not found');
        return form;
    }

    async create(user_uuid: string, form_uuid: string, dto: CreateFormCompletionDto) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const contact = await this.prisma.contact.findFirst({
            where: { uuid: dto.contact_uuid, user_uuid },
        });
        if (!contact) throw new NotFoundException('Contact not found');

        const completion = await this.prisma.formCompletion.create({
            data: {
                form_uuid,
                contact_uuid: dto.contact_uuid,
                completed_by_uuid: user_uuid,
                values: {
                    createMany: {
                        data: dto.values.map((v) => ({
                            field_uuid: v.field_uuid,
                            value: v.value,
                        })),
                    },
                },
            },
            include: {
                contact: { select: { uuid: true, name: true, email: true, company: true } },
                values: {
                    include: {
                        field: { select: { uuid: true, label: true, field_type: true } },
                    },
                },
            },
        });

        this.gateway.emitToUser(user_uuid, 'form_completion.created', completion);
        return completion;
    }

    async findAll(user_uuid: string, form_uuid: string, query: ListFormCompletionsDto) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: any = { form_uuid };
        if (query.contact_uuid) where.contact_uuid = query.contact_uuid;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.formCompletion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    contact: { select: { uuid: true, name: true, email: true, company: true } },
                    values: {
                        include: {
                            field: { select: { uuid: true, label: true, field_type: true } },
                        },
                    },
                },
            }),
            this.prisma.formCompletion.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(user_uuid: string, form_uuid: string, completion_uuid: string) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const completion = await this.prisma.formCompletion.findFirst({
            where: { uuid: completion_uuid, form_uuid },
            include: {
                contact: { select: { uuid: true, name: true, email: true, company: true } },
                values: {
                    include: {
                        field: { select: { uuid: true, label: true, field_type: true } },
                    },
                },
            },
        });

        if (!completion) throw new NotFoundException('Completion not found');
        return completion;
    }

    async update(
        user_uuid: string,
        form_uuid: string,
        completion_uuid: string,
        dto: UpdateFormCompletionDto,
    ) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const completion = await this.prisma.formCompletion.findFirst({
            where: { uuid: completion_uuid, form_uuid },
        });
        if (!completion) throw new NotFoundException('Completion not found');

        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.formCompletionValue.deleteMany({ where: { completion_uuid } });

            await tx.formCompletionValue.createMany({
                data: dto.values.map((v) => ({
                    completion_uuid,
                    field_uuid: v.field_uuid,
                    value: v.value,
                })),
            });

            return tx.formCompletion.findFirst({
                where: { uuid: completion_uuid },
                include: {
                    contact: { select: { uuid: true, name: true, email: true, company: true } },
                    values: {
                        include: {
                            field: { select: { uuid: true, label: true, field_type: true } },
                        },
                    },
                },
            });
        });

        this.gateway.emitToUser(user_uuid, 'form_completion.updated', updated);
        return updated;
    }

    async remove(user_uuid: string, form_uuid: string, completion_uuid: string) {
        await this.assertFormOwnership(user_uuid, form_uuid);

        const completion = await this.prisma.formCompletion.findFirst({
            where: { uuid: completion_uuid, form_uuid },
        });
        if (!completion) throw new NotFoundException('Completion not found');

        await this.prisma.formCompletion.delete({ where: { uuid: completion_uuid } });
        this.gateway.emitToUser(user_uuid, 'form_completion.deleted', {
            uuid: completion_uuid,
            form_uuid,
        });
        return { uuid: completion_uuid };
    }

    async findByContact(user_uuid: string, contact_uuid: string) {
        const contact = await this.prisma.contact.findFirst({
            where: { uuid: contact_uuid, user_uuid },
        });
        if (!contact) throw new NotFoundException('Contact not found');

        return this.prisma.formCompletion.findMany({
            where: {
                contact_uuid,
                form: { user_uuid },
            },
            include: {
                form: { select: { uuid: true, name: true } },
                _count: { select: { values: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
}
