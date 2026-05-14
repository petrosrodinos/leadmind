import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CreateScoringInstructionDto } from './dto/create-scoring-instruction.dto';
import { UpdateScoringInstructionDto } from './dto/update-scoring-instruction.dto';

@Injectable()
export class ScoringInstructionsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(user_uuid: string, dto: CreateScoringInstructionDto) {
        return this.prisma.scoringInstruction.create({
            data: {
                user_uuid,
                name: dto.name.trim(),
                instructions: dto.instructions.trim(),
            },
        });
    }

    async findAll(user_uuid: string) {
        return this.prisma.scoringInstruction.findMany({
            where: { user_uuid },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(user_uuid: string, uuid: string) {
        const row = await this.prisma.scoringInstruction.findFirst({
            where: { uuid, user_uuid },
        });
        if (!row) throw new NotFoundException(`Scoring instruction ${uuid} not found`);
        return row;
    }

    async update(user_uuid: string, uuid: string, dto: UpdateScoringInstructionDto) {
        await this.findOne(user_uuid, uuid);
        return this.prisma.scoringInstruction.update({
            where: { uuid },
            data: {
                ...(dto.name !== undefined && { name: dto.name.trim() }),
                ...(dto.instructions !== undefined && { instructions: dto.instructions.trim() }),
            },
        });
    }

    async remove(user_uuid: string, uuid: string) {
        await this.findOne(user_uuid, uuid);
        await this.prisma.scoringInstruction.delete({ where: { uuid } });
        return { uuid };
    }

    async assertAllOwnedByUser(user_uuid: string, uuids: string[]): Promise<void> {
        if (uuids.length === 0) return;
        const count = await this.prisma.scoringInstruction.count({
            where: { user_uuid, uuid: { in: uuids } },
        });
        if (count !== uuids.length) {
            throw new NotFoundException('One or more scoring instructions were not found');
        }
    }
}
