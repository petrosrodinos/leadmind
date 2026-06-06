import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';

export class UpdateContactDto extends PartialType(
    PickType(CreateContactDto, [
        'filter_uuid',
        'name',
        'email',
        'phone',
        'company',
        'website',
        'google_maps_url',
        'title',
        'location',
        'linkedin_url',
        'industry',
        'description',
    ] as const),
) {
    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    notes?: string;
}
