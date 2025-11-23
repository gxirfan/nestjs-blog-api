import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/mailer/mailer.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RecoverPasswordDto } from './dto/recover-password.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private configService: ConfigService, private mailerService: MailerService) {}

  // calls LocalStrategy .
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsernameAsDocument(username); // requires new method
    if (!user) {
      return null;
    }
    if (user) {
      const isMatch = await this.userService.comparePassword(pass, user.passwordHash); 

      if (isMatch) {         
        user.lastLoginAt = new Date();
        await user.save();
        const { passwordHash, ...result } = user.toObject();
        return result; 
      }
    }
    return null;
  }

  async sendPasswordResetToken(loginField: string): Promise<void> {
      const user = await this.userService.findOneByLoginField(loginField);
      
      if (!user) {
          return; 
      }

      // 15 minute
      const token = crypto.randomInt(100000, 999999).toString();
      user.resetPasswordToken = token;
      user.resetPasswordExpiresAt = new Date(Date.now() + 900000); 

      await user.save(); 

      await this.mailerService.sendMail({
          to: user.email,
          subject: 'Password Reset Request',
          html: `<p>The code required to reset your password: ${token}</p>`,
      });
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findOneByResetToken(token); 

    if (!user) {
        throw new BadRequestException('Invalid or expired reset token.');
    }

    const hashedPassword = await this.userService.hashPassword(newPassword);
    
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined; 
    user.resetPasswordExpiresAt = undefined;

    await user.save();
  }

  async recoverPasswordWithRecoveryCode({ username, recoveryCode, newPassword }: RecoverPasswordDto): Promise<void> {
    
    const user = await this.userService.findOneByUsernameWithCodes(username); 

    if (!user || !user.recoveryCodes || user.recoveryCodes.length === 0) {
        throw new BadRequestException('Kullanıcı adı veya kurtarma kodu geçersiz.');
    }
    
    let codeIndex = -1;
    let codeMatch = false;

    for (let i = 0; i < user.recoveryCodes.length; i++) {
        const isMatch = await this.userService.comparePassword(recoveryCode, user.recoveryCodes[i]);
        if (isMatch) {
            codeMatch = true;
            codeIndex = i;
            break;
        }
    }

    if (!codeMatch) {
        throw new BadRequestException('Kurtarma kodu geçersiz.');
    }

    const newPasswordHash = await this.userService.hashPassword(newPassword);

    user.recoveryCodes.splice(codeIndex, 1);
    

    user.passwordHash = newPasswordHash;
    await user.save();
  }
}