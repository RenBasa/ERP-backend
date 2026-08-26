import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { Unit, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JWTAuthGuard)
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  async create(@Body() unit: Prisma.UnitCreateInput): Promise<Unit> {
    return this.unitService.create(unit);
  }

  @Get()
  async findAll(): Promise<Partial<Unit>[]> {
    return this.unitService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<Unit>> {
    return this.unitService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() unit: Partial<Prisma.UnitUpdateInput>,
  ): Promise<Unit> {
    return this.unitService.update(+id, unit);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Unit> {
    return this.unitService.remove(+id);
  }
}
