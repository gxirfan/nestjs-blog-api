import { Controller, Post, UseGuards, Request, Get, HttpCode, Body, HttpStatus, UseInterceptors, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { CreateUserRequestDto } from 'src/user/dto/create-user.dto';
import { IUserResponse, IUserResponseWithRecoveryCodes } from 'src/user/interfaces/user-response.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

    @UseInterceptors(TransformInterceptor)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Post('register')
    async create(@Body() userDto: CreateUserRequestDto): Promise<IUserResponseWithRecoveryCodes> {
        const user = await this.userService.create(userDto);
        const cleanUserResponse: IUserResponseWithRecoveryCodes = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            nickname: user.nickname,
            bio: user.bio,
            birthDate: user.birthDate,
            avatar: user.avatar,
            cover: user.cover,
            location: user.location,
            gender: user.gender,
            
            createdAt: user.createdAt,
            recoveryCodes: user.recoveryCodes,
        };
        return cleanUserResponse;
    }
  
    // POST /auth/login
    
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @HttpCode(HttpStatus.OK)
    async login(@Request() req) {
        return new Promise((resolve, reject) => {
            req.logIn(req.user, (err: Error) => {
                if (err) {
                    reject(err); 
                }
                const rawUser = req.user.toObject ? req.user.toObject({ virtuals: true }) : req.user;
                    
                const cleanUserResponse: IUserResponse = {
                    id: rawUser.id,
                    username: rawUser.username,
                    firstName: rawUser.firstName,
                    lastName: rawUser.lastName,
                    email: rawUser.email,
                    nickname: rawUser.nickname,
                    bio: rawUser.bio,
                    birthDate: rawUser.birthDate,
                    avatar: rawUser.avatar,
                    cover: rawUser.cover,
                    location: rawUser.location,
                    gender: rawUser.gender,
                    
                    isEmailVerified: rawUser.isEmailVerified,
                    isEmailPublic: rawUser.isEmailPublic,
                    
                    role: rawUser.role,
                    status: rawUser.status,
                    
                    lastLoginAt: rawUser.lastLoginAt,
                    createdAt: rawUser.createdAt,
                    updatedAt: rawUser.updatedAt,
                };
                
                resolve({
                    statusCode: HttpStatus.OK,
                    success: true,
                    message: 'User logged in successfully.',
                    data: cleanUserResponse,
                });
            });
        });
    }
  
    // GET /auth/status
    @UseGuards(AuthenticatedGuard) 
    @Get('status')
    async status(@Request() req) {
        if (req.user) {
            const rawUser = req.user.toObject ? req.user.toObject({ virtuals: true }) : req.user;
            const cleanUserResponse: IUserResponse = {
                    id: rawUser.id,
                    username: rawUser.username,
                    firstName: rawUser.firstName,
                    lastName: rawUser.lastName,
                    email: rawUser.email,
                    nickname: rawUser.nickname,
                    bio: rawUser.bio,
                    birthDate: rawUser.birthDate,
                    avatar: rawUser.avatar,
                    cover: rawUser.cover,
                    location: rawUser.location,
                    gender: rawUser.gender,
                    
                    isEmailVerified: rawUser.isEmailVerified,
                    isEmailPublic: rawUser.isEmailPublic,
                    
                    role: rawUser.role,
                    status: rawUser.status,
                    
                    lastLoginAt: rawUser.lastLoginAt,
                    createdAt: rawUser.createdAt,
                    updatedAt: rawUser.updatedAt,
                };
            return { 
                statusCode: HttpStatus.OK,
                success: true,
                message: 'User is logged in.',
                data: { isLoggedIn: true, user: cleanUserResponse },
            };
        }

        // User is not logged in.
        await new Promise<void>((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
        return { 
            statusCode: HttpStatus.OK,
            success: true,
            message: 'User is not logged in.',
            data: { isLoggedIn: false },
        };
    }
  
    // POST /auth/logout
    @Post('logout')
    async logout(@Request() req, @Res() res) {
        // PassportLogout.
        await new Promise<void>((resolve, reject) => {
            req.logOut((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
        await new Promise<void>((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
        res.clearCookie('connect.sid', { 
            path: '/', 
            httpOnly: true,
            secure: false, 
            sameSite: 'lax'
        });
        res.send();
        return { 
            statusCode: HttpStatus.NO_CONTENT,
            success: true,
            message: 'Logout successful.' 
        };
    }



    // token-request
    @Post('forgot-password')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Password reset instructions have been sent to your email address.')
    async forgotPassword(@Body() { loginField }: ForgotPasswordDto) {
        await this.authService.sendPasswordResetToken(loginField);
    }

    //reset-password
    @Post('reset-password')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Password reset successfully.')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto);
    }

    @Post('recover-password')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Password recovered successfully.')
    async recoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto) {
        await this.authService.recoverPasswordWithRecoveryCode(recoverPasswordDto);
    }
}