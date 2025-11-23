import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminService {
    constructor(private readonly userService: UserService) {}
}
