import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole, UserStatus } from "../schemas/user.schema";

export class BaseUpdateUserDto{
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    nickname?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    lastName?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(500)
    bio?: string;

    @IsOptional()
    @IsEmail()
    @MinLength(1)
    @MaxLength(100)
    email?: string;
}

//update
export class UpdateMeDto extends BaseUpdateUserDto{}

//admin
export class UpdateUserByAdminDto extends BaseUpdateUserDto{
    @IsOptional()
    @IsEnum(UserRole)
    role?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: string;
}

export class UpdateUserPasswordDto{
    @IsString()
    @MinLength(6)
    @MaxLength(250)
    oldPassword: string;
    
    @IsString()
    @MinLength(6)
    @MaxLength(250)
    newPassword: string;
}