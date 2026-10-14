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
import { UserService } from './user.service';
import { User, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JWTAuthGuard, RolesGuard)
@Roles('admin')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() user: Prisma.UserCreateInput): Promise<User> {
    return this.userService.create(user);
  }

  @Get()
  async findAll(): Promise<Partial<User>[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<User>> {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() user: Partial<Prisma.UserUpdateInput>,
    @Req() req,
  ): Promise<Partial<User>> {
    return this.userService.update(req.user.id, +id, user);
  }
  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ): Promise<User> {
    return this.userService.updatePassword(+id, body.password);
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.userService.remove(req.user.id, +id);
  }
}
