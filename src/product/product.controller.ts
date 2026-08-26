import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product, Prisma } from '@prisma/client';
import { createProductDto, updateProductDto } from './dto/createProduct.dto';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JWTAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles('admin')
  @Post()
  async create(@Body() product: createProductDto): Promise<Product> {
    return this.productService.create(product);
  }

  @Roles('admin')
  @Post('withDetails')
  async createWithDetails(
    @Body()
    createProductDto: {
      product: Prisma.ProductCreateInput;
      equivalentUnits: Prisma.EquivalentUnitUncheckedCreateInput[];
    },
  ): Promise<Product> {
    return this.productService.createWithDetails(
      createProductDto.product,
      createProductDto.equivalentUnits,
    );
  }

  @Get()
  async findAll(
    @Query('search') productName,
    @Query('categoryId') categoryId: string,
    @Query('cursor') cursor?: number,
  ): Promise<Product[]> {
    return this.productService.findAll(productName, categoryId, cursor);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(+id);
  }

  //get product by name
  @Get('/name/:name')
  async findByName(@Param('name') name: string): Promise<Product[]> {
    return this.productService.findByName(name);
  }

  //get product and its category and unit
  @Get(':id/details')
  async getProductWithDetails(@Param('id') id: string): Promise<Product> {
    return this.productService.getProductWithDetails(+id);
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() product: updateProductDto,
  ): Promise<Product> {
    return this.productService.update(+id, product);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Product> {
    return this.productService.remove(+id);
  }
}
