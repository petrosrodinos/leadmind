import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SenderProfile } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CreateSenderProfileDto } from './dto/create-sender-profile.dto';
import { UpdateSenderProfileDto } from './dto/update-sender-profile.dto';

@Injectable()
export class SenderProfilesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(user_uuid: string, dto: CreateSenderProfileDto): Promise<SenderProfile> {
        const data: Prisma.SenderProfileUncheckedCreateInput = {
            user_uuid,
            name: dto.name,
            company_name: dto.company_name,
            title: dto.title,
            first_name: dto.first_name,
            last_name: dto.last_name,
            email: dto.email,
            phone: dto.phone,
            website: dto.website,
            address: dto.address,
            city: dto.city,
            country: dto.country,
            logo_url: dto.logo_url,
            booking_url: dto.booking_url,
            sender_id: dto.sender_id,
            signature: dto.signature,
            is_default: dto.is_default ?? false,
        };

        if (data.is_default) {
            const [, profile] = await this.prisma.$transaction([
                this.prisma.senderProfile.updateMany({
                    where: { user_uuid, is_default: true },
                    data: { is_default: false },
                }),
                this.prisma.senderProfile.create({ data }),
            ]);
            return profile;
        }

        return this.prisma.senderProfile.create({ data });
    }

    async findAll(user_uuid: string): Promise<SenderProfile[]> {
        return this.prisma.senderProfile.findMany({
            where: { user_uuid },
            orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
        });
    }

    async findOne(user_uuid: string, uuid: string): Promise<SenderProfile> {
        return this.requireOwnedProfile(user_uuid, uuid);
    }

    async findDefault(user_uuid: string): Promise<SenderProfile | null> {
        const defaultProfile = await this.prisma.senderProfile.findFirst({
            where: { user_uuid, is_default: true },
        });
        if (defaultProfile) return defaultProfile;
        return this.prisma.senderProfile.findFirst({
            where: { user_uuid },
            orderBy: { created_at: 'desc' },
        });
    }

    async update(
        user_uuid: string,
        uuid: string,
        dto: UpdateSenderProfileDto,
    ): Promise<SenderProfile> {
        await this.requireOwnedProfile(user_uuid, uuid);

        const data: Prisma.SenderProfileUpdateInput = {};
        const writable: (keyof UpdateSenderProfileDto)[] = [
            'name',
            'company_name',
            'title',
            'first_name',
            'last_name',
            'email',
            'phone',
            'website',
            'address',
            'city',
            'country',
            'logo_url',
            'booking_url',
            'sender_id',
            'signature',
            'is_default',
        ];
        for (const key of writable) {
            if (dto[key] !== undefined) {
                (data as Record<string, unknown>)[key] = dto[key];
            }
        }

        if (dto.is_default === true) {
            const [, updated] = await this.prisma.$transaction([
                this.prisma.senderProfile.updateMany({
                    where: { user_uuid, is_default: true, NOT: { uuid } },
                    data: { is_default: false },
                }),
                this.prisma.senderProfile.update({
                    where: { uuid },
                    data,
                }),
            ]);
            return updated;
        }

        return this.prisma.senderProfile.update({
            where: { uuid },
            data,
        });
    }

    async remove(user_uuid: string, uuid: string): Promise<{ uuid: string }> {
        await this.requireOwnedProfile(user_uuid, uuid);
        await this.prisma.senderProfile.delete({ where: { uuid } });
        return { uuid };
    }

    private async requireOwnedProfile(
        user_uuid: string,
        uuid: string,
    ): Promise<SenderProfile> {
        const profile = await this.prisma.senderProfile.findFirst({
            where: { uuid, user_uuid },
        });
        if (!profile) {
            throw new NotFoundException(`Sender profile ${uuid} not found`);
        }
        return profile;
    }
}
