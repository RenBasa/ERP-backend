import { Injectable } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { createProductDto, updateProductDto } from './dto/createProduct.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  // TODO: Remove Partials and improve selects, you can find the docs here https://www.prisma.io/client
  async create(product: createProductDto) {
    const equivalencies = product.equivalentUnits;
    delete product.equivalentUnits;
    return await this.prisma.product.create({
      data: {
        ...product,
        equivalentUnits: {
          createMany: {
            data: equivalencies,
          },
        },
      },
    });
  }

  async createWithDetails(
    productData: Prisma.ProductCreateInput,
    equivalentUnitData: Prisma.EquivalentUnitUncheckedCreateInput[],
  ): Promise<Product> {
    return await this.prisma.product.create({
      data: {
        ...productData,
        equivalentUnits: {
          createMany: {
            data: equivalentUnitData,
          },
        },
      },
    });
  }

  // async findAll(productName: string, categoryId: string): Promise<Product[]> {
  //   const parsedCategoryId =
  //     categoryId !== 'null' &&
  //     categoryId !== 'undefined' &&
  //     categoryId !== undefined
  //       ? parseInt(categoryId)
  //       : undefined;
  //   console.log(parsedCategoryId);
  //   return await this.prisma.product.findMany({
  //     where: {
  //       name: {
  //         contains: productName,
  //         mode: 'insensitive',
  //       },
  //       AND: [
  //         {
  //           categoryId: parsedCategoryId,
  //         },
  //       ],
  //     },
  //     include: {
  //       category: true,
  //       unit: true,
  //       equivalentUnits: {
  //         include: {
  //           unit: true,
  //         },
  //       },
  //     },
  //     orderBy: [
  //       // {
  //       //   category: {
  //       //     name: 'asc',
  //       //   },
  //       // },
  //       {
  //         name: 'asc',
  //       },
  //     ],
  //   });
  // }

  async findAll(
    productName: string,
    categoryId: string,
    cursor?: number,
  ): Promise<Product[]> {
    const parsedCategoryId =
      categoryId !== 'null' &&
      categoryId !== 'undefined' &&
      categoryId !== undefined
        ? parseInt(categoryId)
        : undefined;
    if (cursor) {
      return await this.prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  name: {
                    contains: productName,
                    mode: 'insensitive',
                  },
                },
                {
                  productKey: {
                    contains: productName,
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              categoryId: parsedCategoryId,
            },
          ],
        },
        include: {
          category: true,
          unit: true,
          equivalentUnits: {
            include: {
              unit: true,
            },
          },
        },
        orderBy: [
          {
            name: 'asc',
          },
        ],
        cursor: {
          id: +cursor,
        },
        take: 30,
      });
    } else {
      return await this.prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  name: {
                    contains: productName,
                    mode: 'insensitive',
                  },
                },
                {
                  productKey: {
                    contains: productName,
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              categoryId: parsedCategoryId,
            },
          ],
        },
        include: {
          category: true,
          unit: true,
          equivalentUnits: {
            include: {
              unit: true,
            },
          },
        },
        orderBy: [
          {
            name: 'asc',
          },
        ],

        take: 30,
      });
    }
  }

  async findOne(id: number): Promise<Product> {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  //return product with category and unit
  async findOneWithCategoryAndUnit(id: number): Promise<Product> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
      },
    });
  }

  async getProductWithDetails(productId: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true, // Include category
        unit: true, // Include unit
        equivalentUnits: true, // Include equivalent units
      },
    });
  }

  //find by name but name doesnt have to exactly match
  async findByName(name: string): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            productKey: {
              contains: name,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }

  async update(id: number, product: updateProductDto): Promise<Product> {
    // console.log(product);
    const equivalencies = product.equivalentUnits;
    delete product.equivalentUnits;
    // console.log(equivalencies);
    
    // Separate existing (to update) and new (to create) equivalent units
    const toUpdate = equivalencies.filter((eq) => eq.id != null && eq.id > 0);
    const toCreate = equivalencies.filter((eq) => !eq.id || eq.id <= 0);

    // Update existing equivalent units
    for (const equivalency of toUpdate) {
      await this.prisma.equivalentUnit.update({
        where: {
          id: equivalency.id,
        },
        data: {
          equivalent: equivalency.equivalent,
          unitId: equivalency.unitId,
        },
      });
    }

    // Create new equivalent units
    if (toCreate.length > 0) {
      await this.prisma.equivalentUnit.createMany({
        data: toCreate.map((eq) => ({
          equivalent: eq.equivalent,
          unitId: eq.unitId,
          productId: id,
        })),
      });
    }

    const updateProduct: Prisma.ProductUpdateInput = {
      ...product,

      equivalentUnits: {},
    };
    return await this.prisma.product.update({
      where: {
        id: id,
      },
      data: updateProduct,
      include: {
        equivalentUnits: true, // Include related entities in the response if needed
      },
    });
  }

  async remove(id: number): Promise<Product> {
    return await this.prisma.product.delete({ where: { id } });
  }
}
