import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async getWishlists(): Promise<Wishlist[]> {
    return await this.wishlistsService.findAll();
  }

  @Post()
  async createWishlist(
    @Req() req: User,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.create(createWishlistDto, req);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getWishlistById(@Param('id') id: number): Promise<Wishlist> {
    return await this.wishlistsService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateWishlist(
    @Req() req: User,
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.update(id, req.id, updateWishlistDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteWishlist(
    @Req() req: User,
    @Param('id') id: number,
  ): Promise<Wishlist> {
    return await this.wishlistsService.delete(id, req.id);
  }
}
