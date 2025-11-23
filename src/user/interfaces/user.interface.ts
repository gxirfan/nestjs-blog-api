import { IAuditFields } from "src/common/interfaces/common.interface";

export interface IUser extends IAuditFields {
    id: string;
    username: string;
    nickname: string;
    firstName: string;
    lastName: string;
    bio: string;
    email: string;
    isEmailVerified: boolean;
    isEmailPublic: boolean;
    passwordHash: string;
    resetPasswordToken?: string | undefined;
    resetPasswordExpiresAt?: Date | undefined;
    recoveryCodes?: string[];
    role: string;
    status: string;
    lastLoginAt: Date;
}