import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) { }

  @Post()
  @ApiOperation({ summary: 'Send an SMS message (admin only)' })
  @ApiBody({ type: CreateSmDto })
  @ApiResponse({ status: 201, description: 'SMS sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  create(@Body() createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all SMS records (admin only)' })
  @ApiResponse({ status: 200, description: 'List of SMS records' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  findAll() {
    return this.smsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an SMS record by ID (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'SMS record ID' })
  @ApiResponse({ status: 200, description: 'SMS record found' })
  @ApiResponse({ status: 404, description: 'SMS record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  findOne(@Param('id') id: string) {
    return this.smsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an SMS record by ID (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'SMS record ID' })
  @ApiBody({ type: UpdateSmDto })
  @ApiResponse({ status: 200, description: 'SMS record updated' })
  @ApiResponse({ status: 404, description: 'SMS record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  update(@Param('id') id: string, @Body() updateSmDto: UpdateSmDto) {
    return this.smsService.update(+id, updateSmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an SMS record by ID (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'SMS record ID' })
  @ApiResponse({ status: 200, description: 'SMS record deleted' })
  @ApiResponse({ status: 404, description: 'SMS record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  remove(@Param('id') id: string) {
    return this.smsService.remove(+id);
  }
}
