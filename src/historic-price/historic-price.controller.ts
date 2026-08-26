import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistoricPriceService } from './historic-price.service';
import { HistoricPrice, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JWTAuthGuard)
@Controller('historic-price')
export class HistoricPriceController {
  constructor(private readonly historicPriceService: HistoricPriceService) {}

  @Post()
  async create(@Body() data: Prisma.HistoricPriceCreateInput): Promise<HistoricPrice> {
    return this.historicPriceService.create(data);
  }

  @Get()
  async findAll(): Promise<HistoricPrice[]> {
    return this.historicPriceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HistoricPrice | null> {
    return this.historicPriceService.findOne(+id);
  }
  //get using productId
  @Get('product/:productId')
  async findAllByProductId(@Param('productId') productId: string): Promise<HistoricPrice[]> {
    return this.historicPriceService.findAllByProductId(+productId);
  }

  @Get('product/:productId/date/:date')
  async findOneByProductIdAndDate(@Param('productId') productId: string, @Param('date') date: Date): Promise<HistoricPrice | null> {
    return this.historicPriceService.findOneByProductIdAndDate(+productId, date);
  }

  @Patch(':id')
  async update( @Param('id') id: string, @Body() data: Prisma.HistoricPriceUpdateInput): Promise<HistoricPrice> {
    return this.historicPriceService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<HistoricPrice> {
    return this.historicPriceService.remove(+id);
  }
}
