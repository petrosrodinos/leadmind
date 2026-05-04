import { IsNotEmpty, IsString } from "class-validator";

export class CreateSmDto {

    @IsString()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    body: string;

}
