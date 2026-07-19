import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateSmtpAccountDto {
    @ApiProperty({ example: '1' })
    @IsString()
    @Matches(/^[a-zA-Z0-9_-]+$/)
    account!: string;

    @ApiProperty({ example: 'smtp.example.com' })
    @IsString()
    @MinLength(1)
    host!: string;

    @ApiProperty({ example: 587 })
    @IsInt()
    @Min(1)
    @Max(65535)
    port!: number;

    @ApiProperty({ example: 'user@example.com' })
    @IsString()
    @MinLength(1)
    username!: string;

    @ApiProperty({ example: 'app-password' })
    @IsString()
    @MinLength(1)
    password!: string;

    @ApiProperty({ example: 'noreply@example.com' })
    @IsEmail()
    from_email!: string;

    @ApiPropertyOptional({ example: 'Acme Sales' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    from_name?: string;
}
