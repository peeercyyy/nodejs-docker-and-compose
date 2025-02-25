import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOT_YOUR_WISHLIST,
  WISHLIST_NOT_FOUND,
} from 'src/helpers/constants/wishlist';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const wishes = await this.wishesService.findMany(createWishlistDto.itemsId);

    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      items: wishes,
      owner: user,
    });

    return await this.wishlistsRepository.save(wishlist);
  }

  async findById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      relations: {
        owner: true,
        items: true,
      },
      where: { id },
    });

    if (!wishlist) {
      throw new NotFoundException(WISHLIST_NOT_FOUND);
    }

    return wishlist;
  }

  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistsRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async update(
    wishlistId: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findById(wishlistId);

    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException(NOT_YOUR_WISHLIST);
    }

    return await this.wishlistsRepository.save({
      ...wishlist,
      ...updateWishlistDto,
    });
  }

  async delete(wishlistId: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.findById(wishlistId);

    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException(NOT_YOUR_WISHLIST);
    }

    return await this.wishlistsRepository.remove(wishlist);
  }
}
