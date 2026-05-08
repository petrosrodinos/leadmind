import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('leads')
    @ApiOperation({
        summary: 'Search public leads — `q` runs semantic kNN over embeddings, filters constrain results',
    })
    @ApiResponse({ status: 200 })
    searchLeads(@Query() query: SearchDto) {
        return this.searchService.searchLeads(query);
    }

    @Get('contacts')
    @ApiOperation({
        summary: "Search the current user's contacts — `q` runs semantic kNN, always pinned to user_uuid",
    })
    @ApiResponse({ status: 200 })
    searchContacts(
        @CurrentUser('uuid') user_uuid: string,
        @Query() query: SearchDto,
    ) {
        return this.searchService.searchContacts(user_uuid, query);
    }
}
