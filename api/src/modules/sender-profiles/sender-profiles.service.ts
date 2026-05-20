import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SenderProfile } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { normalizeUtmParamsInput } from '@/shared/utils/utm-params.util';
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
            website_utm: this.utmJsonValue(dto.website_utm),
            address: dto.address,
            city: dto.city,
            country: dto.country,
            logo_url: dto.logo_url,
            booking_url: dto.booking_url,
            booking_utm: this.utmJsonValue(dto.booking_utm),
            sender_id: dto.sender_id,
            signature: dto.signature,
            business_description: dto.business_description,
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

    async findForCampaign(user_uuid: string, campaign_uuid: string): Promise<SenderProfile | null> {
        const campaign = await this.prisma.marketingCampaign.findFirst({
            where: { uuid: campaign_uuid, user_uuid },
            select: { sender_profile_uuid: true },
        });
        if (campaign?.sender_profile_uuid) {
            const profile = await this.prisma.senderProfile.findFirst({
                where: { uuid: campaign.sender_profile_uuid, user_uuid },
            });
            if (profile) {
                return profile;
            }
        }
        return this.findDefault(user_uuid);
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
            'website_utm',
            'address',
            'city',
            'country',
            'logo_url',
            'booking_url',
            'booking_utm',
            'sender_id',
            'signature',
            'business_description',
            'is_default',
        ];
        for (const key of writable) {
            if (dto[key] === undefined) {
                continue;
            }
            if (key === 'website_utm' || key === 'booking_utm') {
                (data as Record<string, unknown>)[key] = this.utmJsonValue(dto[key]);
                continue;
            }
            (data as Record<string, unknown>)[key] = dto[key];
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

    private utmJsonValue(
        input?: CreateSenderProfileDto['website_utm'],
    ): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
        const normalized = normalizeUtmParamsInput(input);
        if (normalized === undefined) {
            return undefined;
        }
        if (normalized === null) {
            return Prisma.JsonNull;
        }
        return normalized as Prisma.InputJsonValue;
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
