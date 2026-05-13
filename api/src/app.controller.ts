import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns a hello message to confirm the API is running' })
  @ApiResponse({ status: 200, description: 'API is healthy', schema: { type: 'string', example: 'Hello' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
