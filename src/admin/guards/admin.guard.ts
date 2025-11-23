import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from 'src/user/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const request = context.switchToHttp().getRequest();
    
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('you are not logged in');
    }

    if (user.role && user.role === UserRole.Admin) {
      return true;
    } else {
      throw new ForbiddenException('you are not admin');
    }
  }
}