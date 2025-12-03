import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { IUser } from "../interfaces/user.interface";

export type UserDocument = IUser & Document;
export enum UserRole {
    Admin = 'admin',
    User = 'user',
    Moderator = 'moderator',
}

export enum UserStatus {
    Active = 'active',
    Suspended = 'suspended',
    Banned = 'banned',
}

const userDocumentToJsonTransformer = (doc, ret) => {
    if (ret._id?.toString()) {
        ret.id = ret._id.toString();
    }
    
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    
    return ret;
};

@Schema({ 
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { 
        virtuals: true,
        versionKey: false,
        transform: userDocumentToJsonTransformer,
    },
 })
export class User {

    @Prop({ required: false, default: null, type: String, trim: true })
    avatar?: string;

    @Prop({ required: false, default: null, type: String, trim: true })
    cover?: string;

    @Prop({ required: true, trim: true, unique: true, lowercase: true, maxLength: 50 })
    username: string;

    @Prop({ required: true, trim: true, maxLength: 50 })
    nickname: string;
    
    @Prop({ required: true, trim: true, maxLength: 50 })
    firstName: string;

    @Prop({ required: true, trim: true, maxLength: 50 })
    lastName: string;

    @Prop({ required: false, trim: true, default: '', maxLength: 500 })
    bio?: string;

    @Prop({ required: true, trim: true, unique: true, lowercase: true, maxLength: 100 })
    email: string;

    @Prop({ required: true, default: false })
    isEmailVerified: boolean;

    @Prop({ required: true, default: false })
    isEmailPublic: boolean;

    @Prop({ required: true, select: false })
    passwordHash: string;

    @Prop({ required: true, trim: true, type: String, default: 'user', enum: Object.values(UserRole) })
    role: UserRole;

    @Prop({ required: true, trim: true, type: String, default: 'active', enum: Object.values(UserStatus) })
    status: UserStatus;

    @Prop({ type: Date, default: Date.now })
    lastLoginAt: Date;


    //resetPassword
    @Prop({ required: false, select: false })
    resetPasswordToken?: string; 

    @Prop({ required: false })
    resetPasswordExpiresAt?: Date;

    @Prop({ type: [String], select: false }) 
    recoveryCodes?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
