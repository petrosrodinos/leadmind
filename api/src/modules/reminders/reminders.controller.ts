import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ListRemindersDto } from './dto/list-reminders.dto';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('reminders')
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a reminder for a contact' })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateReminderDto) {
        return this.remindersService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List reminders with optional filters' })
    findAll(@CurrentUser('uuid') user_uuid: string, @Query() query: ListRemindersDto) {
        return this.remindersService.findAll(user_uuid, query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Reminder statistics: pending, due today, overdue, completed this week' })
    getStats(@CurrentUser('uuid') user_uuid: string) {
        return this.remindersService.getUpcomingStats(user_uuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a single reminder' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.remindersService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update a reminder (reschedule, edit title/notes, change status)' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateReminderDto,
    ) {
        return this.remindersService.update(user_uuid, uuid, dto);
    }

    @Put(':uuid/complete')
    @ApiOperation({ summary: 'Mark a reminder as completed' })
    complete(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.remindersService.complete(user_uuid, uuid);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a reminder and cancel its scheduled job' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.remindersService.remove(user_uuid, uuid);
    }
}
