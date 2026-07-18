import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsArray,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { CreateContactDto } from './create-contact.dto';

export class UpdateContactDto extends PartialType(
    PickType(CreateContactDto, [
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
    @ApiPropertyOptional({
        type: [String],
        format: 'uuid',
        description: 'Replace contact list memberships with this set of list uuids.',
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsUUID('4', { each: true })
    list_uuids?: string[];

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    notes?: string;
}
