import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';

// Interceptor temporal
const LoggingInterceptor = {
  intercept(context: any, next: any) {
    const request = context.switchToHttp().getRequest();
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
    );
    return next.handle();
  },
};

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ========== ENDPOINTS HTTP ==========

  @Get('catalog')
  async getPublicCatalog(@Query() filters: FilterProductsDto) {
    return await this.productsService.getPublicCatalog(filters);
  }

  @Get('search/:term')
  async searchProducts(@Param('term') term: string) {
    return await this.productsService.searchProducts(term);
  }

  @Get('stall/:stallId')
  async findByStall(@Param('stallId') stallId: string) {
    return await this.productsService.findByStall(stallId);
  }

  @Get('category/:category')
  async getProductsByCategory(@Param('category') category: string) {
    return await this.productsService.getProductsByCategory(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Headers('x-entrepreneur-id') entrepreneurId: string,
  ) {
    if (!entrepreneurId) {
      throw new HttpException(
        'Se requiere ID de emprendedor',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.productsService.create(createProductDto, entrepreneurId);
  }

  @Get('entrepreneur/my-products')
  async findByEntrepreneur(
    @Headers('x-entrepreneur-id') entrepreneurId: string,
  ) {
    if (!entrepreneurId) {
      throw new HttpException(
        'Se requiere ID de emprendedor',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.productsService.findByEntrepreneur(entrepreneurId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateProductDto,
    @Headers('x-entrepreneur-id') entrepreneurId: string,
  ) {
    if (!entrepreneurId) {
      throw new HttpException(
        'Se requiere ID de emprendedor',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.productsService.update(id, updateData, entrepreneurId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-entrepreneur-id') entrepreneurId: string,
  ) {
    if (!entrepreneurId) {
      throw new HttpException(
        'Se requiere ID de emprendedor',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.productsService.remove(id, entrepreneurId);
    return { message: 'Producto eliminado exitosamente' };
  }

  // ========== ENDPOINTS RPC ==========

  @MessagePattern({ cmd: 'create_product' })
  async handleCreateProduct(@Payload() data: any) {
    return await this.productsService.create(
      data.productData,
      data.entrepreneurId,
    );
  }

  @MessagePattern({ cmd: 'get_product_by_id' })
  async handleGetProduct(@Payload() data: any) {
    return await this.productsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'check_stock' })
  async handleCheckStock(@Payload() data: any) {
    return await this.productsService.checkStock(data.productId, data.quantity);
  }

  @MessagePattern({ cmd: 'update_stock' })
  async handleUpdateStock(@Payload() data: any) {
    return await this.productsService.updateStock(
      data.productId,
      data.quantity,
    );
  }

  @MessagePattern({ cmd: 'get_products_by_stall' })
  async handleGetProductsByStall(@Payload() data: any) {
    return await this.productsService.findByStall(data.stallId);
  }

  @MessagePattern({ cmd: 'get_public_catalog' })
  async handleGetPublicCatalog(@Payload() filters: any) {
    return await this.productsService.getPublicCatalog(filters);
  }
}
