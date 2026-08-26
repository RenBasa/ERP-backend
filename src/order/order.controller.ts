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
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { createOrderDto } from './dto/createOrderDto.dto';
import { ReleaseOrderDto } from './dto/releaseOrderDto.dto';
import { AddPaymentDto } from './dto/addPaymentDto.dto';

@UseGuards(JWTAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Placing an order is the one order-related action every authenticated
  // user (not just admins) is allowed to do — everything else below is
  // Sales-page/management territory and is admin-only.
  @Post()
  async create(@Body() data: createOrderDto, @Req() req): Promise<Order> {
    const userId = req.user.id;
    return this.orderService.create(data, userId);
  }

  @Roles('admin')
  @Post('withDetails')
  async createOrderWithDetails(
    @Body()
    createOrderDto: {
      orderData: Prisma.OrderCreateInput;
      orderDetails: Prisma.OrderDetailUncheckedCreateInput[];
    },
  ): Promise<Order> {
    return this.orderService.createOrderWithDetails(
      createOrderDto.orderData,
      createOrderDto.orderDetails,
    );
  }

  @Roles('admin')
  @Get()
  async findAll(
    @Query('recent') recent,
    @Query('cursor') cursor?: number,
  ): Promise<Order[]> {
    return this.orderService.findAll(recent, cursor);
  }

  @Roles('admin')
  @Get('pending')
  async findAllPending(): Promise<Order[]> {
    return this.orderService.findAllPending();
  }

  @Roles('admin')
  @Get('upfront')
  async findAllWithUpfrontPayment(
    @Query('cursor') cursor?: number,
  ): Promise<Order[]> {
    return this.orderService.findAllWithUpfrontPayment(cursor);
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(+id);
  }

  @Roles('admin')
  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: string): Promise<Order[]> {
    return this.orderService.findallByUserId(+userId);
  }

  @Roles('admin')
  @Get('date/:date')
  async findAllByDate(@Param('date') date: Date): Promise<Order[]> {
    return this.orderService.findallByDate(date);
  }

  @Roles('admin')
  @Get('date/:date/user/:userId')
  async findAllByDateAndUserId(
    @Param('date') date: Date,
    @Param('userId') userId: string,
  ): Promise<Order[]> {
    return this.orderService.findallByDateAndUserId(date, +userId);
  }

  @Roles('admin')
  @Post('release-all')
  async releaseAllOrders(
    @Body() releaseOrderDto?: ReleaseOrderDto,
  ): Promise<{ count: number }> {
    const releaseOrderDetails =
      releaseOrderDto?.releaseOrderDetails !== undefined
        ? releaseOrderDto.releaseOrderDetails
        : false;
    return this.orderService.releaseAllOrders(releaseOrderDetails);
  }

  @Roles('admin')
  @Post(':id/release')
  async releaseOrder(
    @Param('id') id: string,
    @Body() releaseOrderDto?: ReleaseOrderDto,
  ): Promise<Order> {
    const releaseOrderDetails =
      releaseOrderDto?.releaseOrderDetails !== undefined
        ? releaseOrderDto.releaseOrderDetails
        : false;
    return this.orderService.releaseOrder(+id, releaseOrderDetails);
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.OrderUpdateInput,
  ): Promise<Order> {
    return this.orderService.update(+id, data);
  }

  @Roles('admin')
  @Patch(':id/payment')
  async addPayment(
    @Param('id') id: string,
    @Body() addPaymentDto: AddPaymentDto,
  ): Promise<Order> {
    return this.orderService.addPayment(+id, addPaymentDto.amount);
  }

  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status,
  ): Promise<Order> {
    return this.orderService.updateStatus(+id, status);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Order> {
    return this.orderService.remove(+id);
  }

  // delete an order and its details
  @Roles('admin')
  @Delete(':id/details')
  async deleteWithDetails(@Param('id') id: string): Promise<Order> {
    return this.orderService.deleteWithDetails(+id);
  }
}
