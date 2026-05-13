import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  @Post('send-email')
  @ApiOperation({ summary: 'Send a transactional email (admin only)', description: 'Internal endpoint restricted to admins. Sends an email using the configured mail provider.' })
  @ApiBody({ type: CreateMailDto })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailService.create(createMailDto);
  }
}
