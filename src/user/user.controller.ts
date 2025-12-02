import { Body, Controller, Delete, Get, Post, Patch, Request, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import * as updateUserDto from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UserResponseDto } from './dto/user-response.dto';

@UseGuards(AuthenticatedGuard)
@UseInterceptors(TransformInterceptor)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('public-profile/:username')
    @ResponseMessage('User found successfully.')
    async publicProfile(@Request() req): Promise<UserResponseDto> {
        return await this.userService.findOneByUsernameForPublicProfile(req.params.username);
    }

    @Patch('update')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ResponseMessage('User updated successfully.')
    async update(@Request() req, @Body() user: updateUserDto.UpdateMeDto): Promise<UserResponseDto> {
        return await this.userService.update(req.user.id, user);
    }
    
    @Patch('new-recovery-codes')
    @ResponseMessage('New recovery codes generated successfully.')
    async newRecoveryCodes(@Request() req): Promise<string[]> {
        return await this.userService.generateAndSaveRecoveryCodes(req.user.id);
    }

    @Patch('update-password')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ResponseMessage('Password updated successfully.')
    async updatePassword(@Request() req, @Body() user: updateUserDto.UpdateUserPasswordDto): Promise<UserResponseDto> {
        return await this.userService.updatePassword(req.user.id, user);
    }
}
