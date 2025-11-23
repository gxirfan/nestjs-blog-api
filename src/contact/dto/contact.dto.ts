import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ContactDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;
}