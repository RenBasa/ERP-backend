import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistoricEquivalentService } from './historic-equivalent.service';
import { HistoricEquivalent, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JWTAuthGuard)
@Controller('historic-equivalent')
export class HistoricEquivalentController {
  constructor(private readonly historicEquivalentService: HistoricEquivalentService) {}

  @Post()
  async create(@Body() data: Prisma.HistoricEquivalentCreateInput): Promise<HistoricEquivalent> {
    return this.historicEquivalentService.create(data);
  }

  @Get()
  async findAll(): Promise<HistoricEquivalent[]> {
    return this.historicEquivalentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HistoricEquivalent> {
    return this.historicEquivalentService.findOne(+id);
  }


  //get using productId
  @Get('product/:productId')
  async findAllByProductId(@Param('productId') productId: string): Promise<HistoricEquivalent[]> {
    return this.historicEquivalentService.findAllByProductId(+productId);
  }

  //get using productId and date
  @Get('product/:productId/date/:date')
  async findOneByProductIdAndDate(@Param('productId') productId: string, @Param('date') date: Date): Promise<HistoricEquivalent | null> {
    return this.historicEquivalentService.findOneByProductIdAndDate(+productId, date);
  }

  @Patch(':id')
  async update( @Param('id') id: string, @Body() data: Prisma.HistoricEquivalentUpdateInput): Promise<HistoricEquivalent> {
    return this.historicEquivalentService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<HistoricEquivalent> {
    return this.historicEquivalentService.remove(+id);
  }
}
