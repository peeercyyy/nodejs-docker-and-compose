import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  INVALID_EMAIL_OR_PASSWORD,
  USER_NOT_FOUND,
} from 'src/helpers/constants/user';
import { validateHash } from 'src/helpers/hashing';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  auth(user: User) {
    console.log(user);
    const payload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    if (!validateHash(password, user.password)) {
      throw new UnauthorizedException(INVALID_EMAIL_OR_PASSWORD);
    }

    return user;
  }
}
