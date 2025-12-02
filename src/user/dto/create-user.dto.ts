import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserRequestDto {
    @IsString()
    @MinLength(3, {message: "Username must be at least 3 characters long."})
    @MaxLength(50, {message: "Username must be at most 50 characters long."})
    username: string;

    @IsString()
    @IsOptional()
    nickname?: string;

    @IsString()
    @IsNotEmpty({message: "First name is required."})
    @MinLength(1, {message: "First name must be at least 1 character long."})
    @MaxLength(50, {message: "First name must be at most 50 characters long."})
    firstName: string;

    @IsString()
    @IsNotEmpty({message: "Last name is required."})
    @MinLength(1, {message: "Last name must be at least 1 character long."})
    @MaxLength(50, {message: "Last name must be at most 50 characters long."})
    lastName: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsEmail()
    @IsNotEmpty({message: "Email is required."})
    @MinLength(1, {message: "Email must be at least 1 character long."})
    @MaxLength(100, {message: "Email must be at most 100 characters long."})
    email: string;


    
    @IsDate()
    @IsNotEmpty({message: "Birth date is required."})
    birthDate: Date;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsOptional()
    cover?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    gender?: string;
    


    @IsString()
    @IsNotEmpty({message: "Password is required."})
    @MinLength(6, {message: "Password must be at least 6 characters long."})
    @MaxLength(250, {message: "Password must be at most 250 characters long."})
    password: string;
}