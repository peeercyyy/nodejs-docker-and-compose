import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { USER_NOT_FOUND } from 'src/helpers/constants/user';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { Wish } from 'src/wishes/entities/wish.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@Req() req: User): Promise<User> {
    return await this.usersService.findOne(req.id);
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async updateUser(@Req() req: User, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(req.id, updateUserDto);
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  async getMyWishes(@Req() req: User): Promise<Wish[]> {
    return await this.wishesService.getUserWishes(req.id);
  }

  @Get(':username')
  async getUsername(@Param('username') username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string): Promise<Wish[]> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return await this.wishesService.getUserWishes(user.id);
  }

  @Post('find')
  async getMany(@Body('query') query: string): Promise<User[]> {
    return await this.usersService.findMany(query);
  }
}
