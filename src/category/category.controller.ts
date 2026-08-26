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
import { CategoryService } from './category.service';
import { Category, Prisma } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JWTAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body() category: Prisma.CategoryCreateInput,
  ): Promise<Category> {
    return this.categoryService.create(category);
  }

  @Get()
  async findAll(): Promise<Partial<Category>[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<Category>> {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() category: Partial<Prisma.CategoryUpdateInput>,
  ): Promise<Category> {
    return this.categoryService.update(+id, category);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Category> {
    return this.categoryService.remove(+id);
  }
}
