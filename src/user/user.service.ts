import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return await this.prisma.user.create({ data: user });
  }

  async findAll(): Promise<Partial<User>[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        rol: true,
        active: true,
      },
    });
  }

  async findOne(id: number): Promise<Partial<User>> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        rol: true,
        active: true,
      },
    });
  }

  async loginFind(username: string) {
    return await this.prisma.user.findUnique({ where: { username: username } });
  }

  async update(id: number, user: Prisma.UserUpdateInput): Promise<User> {
    const userQuery = await this.prisma.user.update({
      where: { id },
      data: { ...user, password: undefined },
    });
    delete userQuery.password;
    return userQuery;
  }

  async updatePassword(id: number, password: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userQuery = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    delete userQuery.password;
    return userQuery;
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
