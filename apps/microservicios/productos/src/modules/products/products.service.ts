import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(filters?: {
    stallId?: string;
    category?: string;
    available?: boolean;
  }): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product');

    if (filters?.stallId) {
      query.andWhere('product.stallId = :stallId', {
        stallId: filters.stallId,
      });
    }

    if (filters?.category) {
      query.andWhere('product.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.available !== undefined) {
      query.andWhere('product.isAvailable = :available', {
        available: filters.available,
      });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async countProducts(): Promise<number> {
    return await this.productsRepository.count();
  }

  async checkStock(productId: string, quantity: number): Promise<{ available: boolean; stock: number; id: string; price: number; stallId: string }> {
    const product = await this.findOne(productId);
    const available = product.isAvailable && product.stock >= quantity;
    return { available, stock: product.stock, id: product.id, price: product.price as unknown as number, stallId: product.stallId };
  }

  async decrementStock(productId: string, quantity: number): Promise<{ success: boolean; stock: number; id: string }> {
    const product = await this.findOne(productId);
    if (product.stock < quantity) {
      throw new NotFoundException('Stock insuficiente');
    }
    product.stock = product.stock - quantity;
    const saved = await this.productsRepository.save(product);
    return { success: true, stock: saved.stock, id: saved.id };
  }
}
