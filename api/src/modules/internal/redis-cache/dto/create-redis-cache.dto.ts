import { IsString } from "class-validator";

export class CreateRedisCacheDto {
    @IsString()
    key: string;

    @IsString()
    value: string;
}
