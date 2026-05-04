import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WaitlistDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string;


}