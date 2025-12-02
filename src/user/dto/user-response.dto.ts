import { IAuditFields } from "src/common/interfaces/common.interface";
import { IUserBaseProfile } from "../interfaces/user-base-response.interface";

export class UserResponseDto implements IUserBaseProfile, IAuditFields {
    id: string;
    username: string;
    nickname?: string;
    firstName: string;
    lastName: string;
    bio?: string;
    email: string;
    isEmailVerified: boolean;
    isEmailPublic: boolean;
    role: string;
    status: string;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    birthDate: Date;
    avatar?: string;
    cover?: string;
    location?: string;
    gender?: string;
}

export class UserResponseWithRecoveryCodesDto implements IUserBaseProfile, IAuditFields {
    id: string;
    username: string;
    nickname?: string;
    firstName: string;
    lastName: string;
    bio?: string;
    email: string;
    recoveryCodes: string[];
    createdAt: Date;
    updatedAt: Date;
    isEmailVerified: boolean;
    isEmailPublic: boolean;
    role: string;
    status: string;
    lastLoginAt: Date;
    birthDate: Date;
    avatar?: string;
    cover?: string;
    location?: string;
    gender?: string;
}