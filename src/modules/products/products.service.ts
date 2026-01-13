import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject('STALLS_SERVICE') private stallsClient: ClientProxy,
  ) {}

  // ========== GESTIÓN DE PRODUCTOS (Emprendedores) ==========
  
  async create(createProductDto: CreateProductDto, entrepreneurId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      entrepreneurId,
      isAvailable: createProductDto.stock > 0,
      isActive: true,
    });
    return await this.productRepository.save(product);
  }

  async findByEntrepreneur(entrepreneurId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { entrepreneurId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, updateData: UpdateProductDto, entrepreneurId: string): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.entrepreneurId !== entrepreneurId) {
      throw new BadRequestException('No eres el dueño de este producto');
    }

    if (updateData.stock !== undefined) {
      updateData.isAvailable = updateData.stock > 0;
    }

    Object.assign(product, updateData);
    return await this.productRepository.save(product);
  }

  async remove(id: string, entrepreneurId: string): Promise<void> {
    const product = await this.findOne(id);
    
    if (product.entrepreneurId !== entrepreneurId) {
      throw new BadRequestException('No eres el dueño de este producto');
    }

    product.isActive = false;
    product.isAvailable = false;
    await this.productRepository.save(product);
  }

  // ========== CATÁLOGO PÚBLICO ==========

  async getPublicCatalog(filters: FilterProductsDto): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true });

    // Aplicar filtros
    if (filters.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }
    if (filters.stallId) {
      query.andWhere('product.stallId = :stallId', { stallId: filters.stallId });
    }
    if (filters.minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const total = await query.getCount();
    const products = await query
      .orderBy('product.createdAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return {
      products,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${searchTerm}%`,
      })
      .getMany();
  }

  async findByStall(stallId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { 
        stallId,
        isActive: true,
        isAvailable: true 
      },
    });
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { 
        category,
        isActive: true,
        isAvailable: true 
      },
      order: { price: 'ASC' },
    });
  }

  // ========== FUNCIONALIDADES PARA PEDIDOS ==========

  async checkStock(productId: string, quantity: number): Promise<{ 
    isAvailable: boolean; 
    availableStock: number;
    product: Product;
  }> {
    const product = await this.productRepository.findOne({
      where: { 
        id: productId,
        isActive: true,
        isAvailable: true 
      }
    });
    
    if (!product) {
      throw new NotFoundException(`Producto ${productId} no disponible`);
    }

    return {
      isAvailable: product.hasEnoughStock(quantity),
      availableStock: product.stock,
      product,
    };
  }

  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);
    
    if (!product.hasEnoughStock(quantity)) {
      throw new BadRequestException('Stock insuficiente');
    }

    product.updateStock(-quantity);
    return await this.productRepository.save(product);
  }
}