import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RpcValidationPipe } from '../common/pipes/rpc-validation.pipe';

@Controller()
@UsePipes(new RpcValidationPipe())
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'products.create' })
  async create(@Payload() data: CreateProductDto) {
    try {
      return await this.productsService.create(data);
    } catch (error) {
      throw new RpcException({
        status: error.status || 400,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'products.findAll' })
  async findAll(@Payload() filters: any) {
    try {
      return await this.productsService.findAll(filters);
    } catch (error) {
      throw new RpcException({
        status: error.status || 400,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'products.findOne' })
  async findOne(@Payload() data: { id: string }) {
    try {
      return await this.productsService.findOne(data.id);
    } catch (error) {
      throw new RpcException({
        status: error.status || 404,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'products.update' })
  async update(@Payload() data: { id: string; updateData: UpdateProductDto }) {
    try {
      return await this.productsService.update(data.id, data.updateData);
    } catch (error) {
      throw new RpcException({
        status: error.status || 400,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'products.delete' })
  async remove(@Payload() data: { id: string }) {
    try {
      return await this.productsService.remove(data.id);
    } catch (error) {
      throw new RpcException({
        status: error.status || 404,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'products.health' })
  async healthCheck() {
    return { 
      status: 'ok', 
      service: 'products', 
      timestamp: new Date().toISOString() 
    };
  }
}
