import { IsIn, IsString } from 'class-validator';
import { EntityType } from '../enums/entity-type.enum';

export class GetVoteStatusDto {
    @IsString()
    postId: string;

    @IsIn(Object.values(EntityType))
    type: EntityType;
}