import { Body, Controller, Delete, Get, Post, Patch, Request, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import * as updateUserDto from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common';
import { mediaUploadOptions } from 'src/common/utils/media-upload.utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import {Multer} from 'multer';
@UseInterceptors(TransformInterceptor)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('public-profile/:username')
    @ResponseMessage('User found successfully.')
    async publicProfile(@Request() req): Promise<UserResponseDto> {
        return await this.userService.findOneByUsernameForPublicProfile(req.params.username);
    }

    @UseGuards(AuthenticatedGuard)
    @Patch('update')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ResponseMessage('User updated successfully.')
    async update(@Request() req, @Body() user: updateUserDto.UpdateMeDto): Promise<UserResponseDto> {
        return await this.userService.update(req.user.id, user);
    }

    @Patch('me/media')
    @UseGuards(AuthenticatedGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'avatar', maxCount: 1 },
            { name: 'cover', maxCount: 1 },
        ], mediaUploadOptions),
    )
    @ResponseMessage('Media updated successfully.')
    async updateMedia(
        @UploadedFiles() files: { avatar?: Multer.File[]; cover?: Multer.File[] },
        @Request() req
    ): Promise<{ avatarUrl?: string; coverUrl?: string }> {

        const userId = req.user.id;
        const updatePayload: { avatar?: string; cover?: string } = {};

        if (files.avatar && files.avatar[0]) {
            updatePayload.avatar = `/images/user/avatars/${files.avatar[0].filename}`;
        }

        if (files.cover && files.cover[0]) {
            updatePayload.cover = `/images/user/covers/${files.cover[0].filename}`;
        }

        if (Object.keys(updatePayload).length === 0) {
            throw new HttpException('No file uploaded or file names did not match expected fields (avatar/cover).', HttpStatus.BAD_REQUEST);
        }

        const updatedUser = await this.userService.updateUserMedia(userId, updatePayload);

        return {
            avatarUrl: updatedUser.avatar,
            coverUrl: updatedUser.cover
        };
    }

    @UseGuards(AuthenticatedGuard)
    @Patch('new-recovery-codes')
    @ResponseMessage('New recovery codes generated successfully.')
    async newRecoveryCodes(@Request() req): Promise<string[]> {
        return await this.userService.generateAndSaveRecoveryCodes(req.user.id);
    }

    @UseGuards(AuthenticatedGuard)
    @Patch('update-password')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ResponseMessage('Password updated successfully.')
    async updatePassword(@Request() req, @Body() user: updateUserDto.UpdateUserPasswordDto): Promise<UserResponseDto> {
        return await this.userService.updatePassword(req.user.id, user);
    }
}
