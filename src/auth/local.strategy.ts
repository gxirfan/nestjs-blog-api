import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IUserResponse } from 'src/user/interfaces/user-response.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<IUserResponse> {
    const user = await this.authService.validateUser(username, password); 
    if (!user) {
      throw new UnauthorizedException('Unauthorized.');
    }
    return user; 
  }
}