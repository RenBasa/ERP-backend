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
import { createOrderDto } from './dto/createOrderDto.dto';
import { ReleaseOrderDto } from './dto/releaseOrderDto.dto';
import { AddPaymentDto } from './dto/addPaymentDto.dto';

@UseGuards(JWTAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: createOrderDto, @Req() req): Promise<Order> {
    const userId = req.user.id;
    return this.orderService.create(data, userId);
  }

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

  @Get()
  async findAll(
    @Query('recent') recent,
    @Query('cursor') cursor?: number,
  ): Promise<Order[]> {
    return this.orderService.findAll(recent, cursor);
  }

  @Get('pending')
  async findAllPending(): Promise<Order[]> {
    return this.orderService.findAllPending();
  }

  @Get('upfront')
  async findAllWithUpfrontPayment(
    @Query('cursor') cursor?: number,
  ): Promise<Order[]> {
    return this.orderService.findAllWithUpfrontPayment(cursor);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(+id);
  }

  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: string): Promise<Order[]> {
    return this.orderService.findallByUserId(+userId);
  }

  @Get('date/:date')
  async findAllByDate(@Param('date') date: Date): Promise<Order[]> {
    return this.orderService.findallByDate(date);
  }

  @Get('date/:date/user/:userId')
  async findAllByDateAndUserId(
    @Param('date') date: Date,
    @Param('userId') userId: string,
  ): Promise<Order[]> {
    return this.orderService.findallByDateAndUserId(date, +userId);
  }

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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.OrderUpdateInput,
  ): Promise<Order> {
    return this.orderService.update(+id, data);
  }
  @Patch(':id/payment')
  async addPayment(
    @Param('id') id: string,
    @Body() addPaymentDto: AddPaymentDto,
  ): Promise<Order> {
    return this.orderService.addPayment(+id, addPaymentDto.amount);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status,
  ): Promise<Order> {
    return this.orderService.updateStatus(+id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Order> {
    return this.orderService.remove(+id);
  }

  // delete an order and its details
  @Delete(':id/details')
  async deleteWithDetails(@Param('id') id: string): Promise<Order> {
    return this.orderService.deleteWithDetails(+id);
  }
}
