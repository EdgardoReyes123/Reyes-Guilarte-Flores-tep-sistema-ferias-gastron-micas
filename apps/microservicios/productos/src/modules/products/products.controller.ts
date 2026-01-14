// products.controller.ts - SOLO para comunicación entre microservicios (TCP/RPC)
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('productos.findAll')
  findAll(@Payload() filters: FilterProductsDto) {
    return this.productsService.findAll(filters);
  }

  @MessagePattern('productos.create')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern('productos.findOne')
  findOne(@Payload() id: number) {
    return this.productsService.findOne(id);
  }

  @MessagePattern('productos.update')
  update(@Payload() data: { id: number, updateData: UpdateProductDto }) {
    return this.productsService.update(data.id, data.updateData);
  }

  @MessagePattern('productos.remove')
  remove(@Payload() id: number) {
    return this.productsService.remove(id);
  }
}