import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    title: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    content: string;
    
    @IsString()
    @IsNotEmpty()
    topicId: string;
    
    @IsString()
    @IsOptional()
    parentId?: string;
}
