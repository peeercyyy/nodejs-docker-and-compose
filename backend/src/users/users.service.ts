import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  USER_ALREADY_EXIST,
  USER_EMAIL_CANT_BE_USED,
  USER_NOT_FOUND,
} from 'src/helpers/constants/user';
import { createHash } from 'src/helpers/hashing';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = await this.findByEmail(createUserDto.email);
    const username = await this.findByUsername(createUserDto.username);

    if (email) {
      throw new ForbiddenException(USER_ALREADY_EXIST);
    }

    if (username) {
      throw new ForbiddenException(USER_ALREADY_EXIST);
    }

    return await this.usersRepository.save({
      ...createUserDto,
      password: await createHash(createUserDto.password),
    });
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await createHash(updateUserDto.password);
    }
    if (updateUserDto.email) {
      const email = await this.findByEmail(updateUserDto.email);

      if (email) {
        throw new ForbiddenException(USER_EMAIL_CANT_BE_USED);
      }
    }

    if (updateUserDto.username) {
      const username = await this.findByUsername(updateUserDto.username);

      if (username) {
        throw new ForbiddenException(USER_ALREADY_EXIST);
      }
    }

    await this.usersRepository.update({ id }, updateUserDto);

    return await this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOneBy({ username });
  }

  async findMany(query: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }
}
