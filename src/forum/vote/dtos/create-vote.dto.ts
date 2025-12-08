import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { EntityType } from '../enums/entity-type.enum';

export class CreateVoteDto {
    @IsString()
    @IsNotEmpty()
    postId: string;

    @IsIn(Object.values(EntityType))
    @IsNotEmpty()
    type: EntityType;

    @IsInt()
    @Min(-1)
    @Max(1)
    @IsNotEmpty()
    direction: number;
}