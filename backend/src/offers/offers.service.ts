import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MONEY_ALREADY_COLLECTED,
  OFFER_NOT_FOUND,
  SUM_GREATER_THAN_AMOUNT,
  SUM_GREATER_THAN_PRICE,
  YOU_CANT_PAY_OWN_WISH,
} from 'src/helpers/constants/offer';
import { WISH_NOT_FOUND } from 'src/helpers/constants/wish';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.getById(createOfferDto.itemId);
    const remainingSum = wish.price - wish.raised;

    if (!wish) {
      throw new NotFoundException(WISH_NOT_FOUND);
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException(YOU_CANT_PAY_OWN_WISH);
    }

    if (wish.raised === wish.price) {
      throw new ForbiddenException(MONEY_ALREADY_COLLECTED);
    }

    if (createOfferDto.amount > wish.price) {
      throw new ForbiddenException(SUM_GREATER_THAN_PRICE);
    }

    if (createOfferDto.amount > remainingSum) {
      throw new ForbiddenException(SUM_GREATER_THAN_AMOUNT);
    }

    await this.wishesService.updateRaised(
      wish.id,
      wish.raised + createOfferDto.amount,
    );

    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      user,
      item: wish,
    });

    return await this.offerRepository.save(newOffer);
  }

  async findById(offerId: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: {
        id: offerId,
      },
      relations: {
        user: true,
        item: true,
      },
    });

    if (!offer) {
      throw new NotFoundException(OFFER_NOT_FOUND);
    }

    return offer;
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }
}
