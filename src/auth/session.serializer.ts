import { PassportSerializer } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import { IUserResponse } from 'src/user/interfaces/user-response.interface';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: IUserResponse, done: (err: Error | null, id: string | null) => void): void {
    try {
      const userId = user.id; 
      
      if (!userId) {
          return done(new Error('Not found user id.'), null);
      }
      
      done(null, userId.toString()); 
    } catch (e) {
      return done(e, null); 
    }
  }

  async deserializeUser(payload: string, done: (err: Error | null, user: any) => void): Promise<void> {
    try {
      const user = await this.userService.findOneByIdAsDocument(payload); 
      if (user) {
        const userResponseDto: IUserResponse = {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isEmailPublic: user.isEmailPublic,
          role: user.role,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        done(null, userResponseDto); 
      } else {
        done(null, null); 
      }
    } catch (e) {
      return done(e, null); 
    }
  }
}