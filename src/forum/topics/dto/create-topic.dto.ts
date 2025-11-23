import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTopicDto {
    @IsNotEmpty({ message: 'Title is required.' })
    @IsString({ message: 'Title must be a string.' })
    @MinLength(5, { message: 'Title must be at least 5 characters long.' })
    @MaxLength(100, { message: 'Title must be at most 100 characters long.' })
    title: string;

    @IsNotEmpty({ message: 'Content is required.' })
    @IsString({ message: 'Content must be a string.' })
    @MinLength(20, { message: 'Content must be at least 20 characters long.' })
    content: string;

    @IsNotEmpty({ message: 'Tag ID is required.' })
    @IsString({ message: 'Tag ID must be a string.' })
    tagId: string;
}