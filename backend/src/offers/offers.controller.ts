import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Req() req: User,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    return await this.offersService.create(req, createOfferDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAllOffer(): Promise<Offer[]> {
    return await this.offersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOfferById(@Param('id') id: number): Promise<Offer> {
    return await this.offersService.findById(id);
  }
}
