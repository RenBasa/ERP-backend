import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

// Accounts used by devices rather than people: the order printer and the
// sales terminal log in with these usernames. Deactivating, deleting,
// renaming or demoting one would silently stop that device from working.
const SERVICE_ACCOUNTS = ['Terminal_Impresora', 'terminalVenta'];

// Prisma update inputs accept either a plain value or { set: value }.
const plainValue = (value: unknown) =>
  value !== null && typeof value === 'object' && 'set' in value
    ? (value as { set: unknown }).set
    : value;

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

  // Refuses changes that would lock everyone out of admin or break a
  // device: an admin removing their own access, removing the last active
  // admin, or touching a service account's login, role or status.
  private async assertSafeChange(
    actorId: number,
    targetId: number,
    change: {
      remove?: boolean;
      active?: unknown;
      rol?: unknown;
      username?: unknown;
    },
  ) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) {
      throw new NotFoundException(`User ID ${targetId} not found`);
    }
    if (change.active !== undefined && typeof change.active !== 'boolean') {
      throw new BadRequestException('active debe ser true o false.');
    }
    const deactivates = change.active === false && target.active;
    const demotes =
      change.rol !== undefined &&
      change.rol !== target.rol &&
      target.rol === 'admin';
    const renames =
      change.username !== undefined && change.username !== target.username;
    const losesAccess = change.remove || deactivates || demotes;

    if (
      SERVICE_ACCOUNTS.includes(target.username) &&
      (losesAccess ||
        renames ||
        (change.rol !== undefined && change.rol !== target.rol))
    ) {
      throw new BadRequestException(
        `${target.username} es la cuenta de un dispositivo (impresora o terminal); no se puede desactivar, borrar, renombrar ni cambiar de rol.`,
      );
    }
    if (actorId === targetId && losesAccess) {
      throw new BadRequestException(
        'No puedes quitarte el acceso de administrador a ti mismo.',
      );
    }
    if (target.rol === 'admin' && target.active && losesAccess) {
      // Device accounts are admins too, but they belong to a device rather
      // than a person, so they don't count as a remaining admin.
      const activeAdmins = await this.prisma.user.count({
        where: {
          rol: 'admin',
          active: true,
          username: { notIn: SERVICE_ACCOUNTS },
        },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException(
          'Debe quedar al menos un administrador activo.',
        );
      }
    }
  }

  async update(
    actorId: number,
    id: number,
    user: Prisma.UserUpdateInput,
  ): Promise<User> {
    await this.assertSafeChange(actorId, id, {
      active: plainValue(user.active),
      rol: plainValue(user.rol),
      username: plainValue(user.username),
    });
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

  async remove(actorId: number, id: number): Promise<void> {
    await this.assertSafeChange(actorId, id, { remove: true });
    await this.prisma.user.delete({ where: { id } });
  }
}
