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
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Req() req: User, @Body() createWishDto: CreateWishDto) {
    return await this.wishesService.create(req, createWishDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.wishesService.getById(+id);
  }

  @Get('last')
  async getLast(): Promise<Wish[]> {
    return await this.wishesService.getLast();
  }

  @Get('top')
  async getTop(): Promise<Wish[]> {
    return await this.wishesService.getTop();
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Req() req: User,
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    return this.wishesService.update(+id, req.id, updateWishDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Req() req: User, @Param('id') id: string): Promise<Wish> {
    return await this.wishesService.delete(+id, req.id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copy(@Req() req: User, @Param('id') id: number): Promise<Wish> {
    return await this.wishesService.copy(id, req);
  }
}
