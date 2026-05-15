import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { GemiService } from '@/integrations/gemi/gemi.service';

@ApiTags('gemi')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('gemi')
export class GemiController {
    constructor(private readonly gemiService: GemiService) {}

    @Get('prefectures')
    @ApiOperation({ summary: 'List Greek prefectures for filter selection' })
    getPrefectures() {
        return this.gemiService.getPrefectures();
    }

    @Get('legal-types')
    @ApiOperation({ summary: 'List GEMI legal entity types for filter selection' })
    getLegalTypes() {
        return this.gemiService.getLegalTypes();
    }

    @Get('statuses')
    @ApiOperation({ summary: 'List GEMI company statuses for filter selection' })
    getStatuses() {
        return this.gemiService.getCompanyStatuses();
    }
}
