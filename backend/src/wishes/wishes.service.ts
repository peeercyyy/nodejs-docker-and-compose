import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RAISED_NOT_NULL,
  WISH_ARE_COPIED,
  WISH_NOT_FOUND,
  WISH_NOT_YOURS,
} from 'src/helpers/constants/wish';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    return await this.wishRepository.save({
      ...createWishDto,
      owner: owner,
    });
  }

  async getTop(): Promise<Wish[]> {
    return await this.wishRepository.find({
      order: {
        copied: 'DESC',
      },
      take: 10,
    });
  }

  async getLast(): Promise<Wish[]> {
    return await this.wishRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 20,
    });
  }

  async getUserWishes(id: number): Promise<Wish[]> {
    return await this.wishRepository.find({
      where: {
        owner: { id },
      },
      relations: {
        owner: true,
      },
    });
  }

  async getById(wishId: number): Promise<Wish> {
    return await this.wishRepository.findOne({
      where: {
        id: wishId,
      },
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  async findMany(items: number[]): Promise<Wish[]> {
    return await this.wishRepository.find({
      where: {
        id: In(items),
      },
    });
  }

  async findAll(): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({
      relations: ['owner', 'offers'],
    });

    return wishes;
  }

  async update(
    wishId: number,
    userId: number,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.getById(wishId);

    if (!wish) {
      throw new NotFoundException(WISH_NOT_FOUND);
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException(WISH_NOT_YOURS);
    }

    if (wish.raised > 0) {
      throw new ForbiddenException(RAISED_NOT_NULL);
    }

    return await this.wishRepository.save({ ...wish, ...updateWishDto });
  }

  async updateRaised(wishId: number, newRaised: number): Promise<Wish> {
    const wish = await this.getById(wishId);

    if (!wish) {
      throw new NotFoundException(WISH_NOT_FOUND);
    }

    return await this.wishRepository.save({ ...wish, raised: newRaised });
  }

  async delete(wishId: number, userId: number): Promise<Wish> {
    const wish = await this.getById(wishId);

    if (!wish) {
      throw new NotFoundException(WISH_NOT_FOUND);
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException(WISH_NOT_YOURS);
    }

    return await this.wishRepository.remove(wish);
  }

  async copy(wishId: number, user: User): Promise<Wish> {
    const wish = await this.getById(wishId);

    if (!wish) {
      throw new NotFoundException(WISH_NOT_FOUND);
    }

    if (user.id === wish.owner.id) {
      throw new ForbiddenException(WISH_ARE_COPIED);
    }

    await this.wishRepository.update(wishId, {
      copied: (wish.copied += 1),
    });

    const wishCopy = {
      ...wish,
      owner: user.id,
      raised: 0,
      copied: 0,
      offers: [],
    };

    return await this.create(user, wishCopy);
  }
}
