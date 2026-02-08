import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(client: Prisma.ClientCreateInput): Promise<Client> {
    return await this.prisma.client.create({ data: client });
  }

  async findAll(): Promise<Client[]> {
    return await this.prisma.client.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Client> {
    return await this.prisma.client.findUnique({ where: { id } });
  }

  async update(id: number, client: Prisma.ClientUpdateInput): Promise<Client> {
    return await this.prisma.client.update({ where: { id }, data: client });
  }

  async remove(id: number): Promise<Client> {
    return await this.prisma.client.delete({ where: { id } });
  }
}
