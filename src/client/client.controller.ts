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
import { ClientService } from './client.service';
import { Client, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JWTAuthGuard, RolesGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Roles('admin')
  @Post()
  async create(@Body() client: Prisma.ClientCreateInput): Promise<Client> {
    return await this.clientService.create(client);
  }

  @Get()
  async findAll(): Promise<Client[]> {
    return await this.clientService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Client> {
    return await this.clientService.findOne(+id);
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() client: Prisma.ClientUpdateInput,
  ): Promise<Client> {
    return await this.clientService.update(+id, client);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Client> {
    return await this.clientService.remove(+id);
  }
}
