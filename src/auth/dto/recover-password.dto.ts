import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class RecoverPasswordDto {
    @IsNotEmpty() @IsString() username: string;
    @IsNotEmpty() @IsString() recoveryCode: string;
    @IsNotEmpty() @IsString() @MinLength(8) newPassword: string;
}