import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UpdateMeDto, UpdateUserByAdminDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
@Injectable()
export class UserService {
    constructor (@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
    //create
    async create(userDto: CreateUserRequestDto): Promise<UserDocument & { recoveryCodes: string[] }> {
    
        try {
            const hashedPassword = await this.hashPassword(userDto.password);

            if (!userDto.nickname) userDto.nickname = userDto.username;
    
            const newUser = new this.userModel({
                ...userDto,
                passwordHash: hashedPassword,
            });
    
            const savedUser = await newUser.save();
    
            const recoveryCodes = await this.generateAndSaveRecoveryCodes(savedUser.id);
            
            const userWithCodes = savedUser.toObject(); 
            
            userWithCodes.recoveryCodes = recoveryCodes;
            
            // return mongoose document (js object) with recovery codes
            return userWithCodes as UserDocument & { recoveryCodes: string[] };
    
        } catch (error) {
            if (error.code === 11000) { // MongoDB Duplicate Key
                throw new ConflictException('username or email is already taken.'); // 409 Conflict
            }
            throw new InternalServerErrorException('User registration failed due to an unexpected error.');
        }
    }

    //read
    async findAll(): Promise<UserDocument[]> {
        const users = await this.userModel.find().exec();
        if (!users) {
            throw new NotFoundException('Users not found');
        }
        if (users.length === 0) {
            throw new NotFoundException('Users not found');
        }
        return users;
    }

    //using session serializer
    async findOneByIdAsDocument(id: string): Promise<UserDocument | null> {
        return await this.userModel.findById(id).exec();
    }

    //using auth validation
    async findOneByUsernameAsDocument(loginField: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ $or: [{ username: loginField }, { email: loginField }]})
        .select('+passwordHash')
        .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findOneById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findOneByUsername(username: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    //using-for-password-reset
    async findOneByLoginField(loginField: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({
            $or: [
                { email: loginField.toLowerCase() },
                { username: loginField },
            ],
        }).select('+resetPasswordToken')
        .exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findOneByResetToken(token: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async generateAndSaveRecoveryCodes(userId: string): Promise<string[]> {
        const NUMBER_OF_CODES = 5;
        let codes: string[] = [];
        let hashedCodes: string[] = [];

        for (let i = 0; i < NUMBER_OF_CODES; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
            const hashed = await this.hashPassword(code);
            hashedCodes.push(hashed);
        }

        await this.userModel.updateOne(
            { _id: userId },
            { recoveryCodes: hashedCodes }
        ).exec();

        return codes;
    }

    async findOneByUsernameWithCodes(username: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ username }).select('+recoveryCodes').exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    //update
    async update(id: string, user: UpdateMeDto):Promise<UserDocument> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return updatedUser;
    }

    async updatePassword(id: string, user: UpdateUserPasswordDto):Promise<UserDocument> {
        const foundUser = await this.userModel.findById(id).select('+passwordHash').exec();
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        
        const isMatch = await this.comparePassword(user.oldPassword, foundUser.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('Old password is incorrect');
        }

        foundUser.passwordHash = await this.hashPassword(user.newPassword);
        return await foundUser.save();
    }

    //admin
    async updateUserByAdmin(id: string, user: UpdateUserByAdminDto):Promise<UserDocument> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return updatedUser;
    }

    async updatePasswordByAdmin(id: string, newPassword: string):Promise<UserDocument> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, { passwordHash: await this.hashPassword(newPassword) }, { new: true }).exec();
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return updatedUser;
    }

    async deleteUser(id: string):Promise<UserDocument> {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }
        return deletedUser;
    }
}
