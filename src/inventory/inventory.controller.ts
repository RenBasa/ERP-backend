import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { InventoryDTO } from './entities/inventory.entity';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JWTAuthGuard, RolesGuard)
@Roles('admin')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(
    @Body() inventory: InventoryDTO,
    @Req() req,
  ): Promise<Inventory> {
    const userId = req.user.id;
    return this.inventoryService.create(inventory, userId);
  }

  @Get()
  async findAll(): Promise<Partial<Inventory>[]> {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<Inventory>> {
    return this.inventoryService.findOne(+id);
  }

  // not needed
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() inventory: Partial<Prisma.InventoryUpdateInput>,
  ): Promise<Inventory> {
    return this.inventoryService.update(+id, inventory);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.remove(+id);
  }
}
