import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Logger } from '@nestjs/common';

@Controller()
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'createProducto' })
  async create(@Payload() data: any) {
    try {
      this.logger.log(`Creando producto: ${JSON.stringify(data)}`);

      const createProductDto = data as CreateProductDto;
      return await this.productsService.create(createProductDto);
    } catch (error) {
      this.logger.error(`Error creando producto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error creando producto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'getProductos' })
  async findAll(@Payload() filters: any) {
    try {
      this.logger.log(
        `Buscando productos con filtros: ${JSON.stringify(filters)}`,
      );

      // Mapear los filtros del API Gateway al formato del servicio
      const queryParams = {
        stallId: filters?.stallId || filters?.puestoId, // Compatibilidad con ambos nombres
        category: filters?.category || filters?.categoria,
        available:
          filters?.available !== undefined
            ? filters.available === 'true'
            : filters?.disponible !== undefined
            ? filters.disponible === 'true'
            : undefined,
      };

      return await this.productsService.findAll(queryParams);
    } catch (error) {
      this.logger.error(`Error buscando productos: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error obteniendo productos',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'getProducto' })
  async findOne(@Payload() data: any) {
    try {
      const { id } = data;
      this.logger.log(`Buscando producto ID: ${id}`);

      return await this.productsService.findOne(id);
    } catch (error) {
      this.logger.error(`Error buscando producto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error obteniendo producto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'updateProducto' })
  async update(@Payload() data: any) {
    try {
      const { id, ...updateData } = data;
      this.logger.log(`Actualizando producto ID: ${id}`);

      const updateProductDto = updateData as UpdateProductDto;
      return await this.productsService.update(id, updateProductDto);
    } catch (error) {
      this.logger.error(`Error actualizando producto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error actualizando producto',
        statusCode: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'deleteProducto' })
  async remove(@Payload() data: any) {
    try {
      const { id } = data;
      this.logger.log(`Eliminando producto ID: ${id}`);

      await this.productsService.remove(id);
      return {
        success: true,
        message: 'Producto eliminado exitosamente',
      };
    } catch (error) {
      this.logger.error(`Error eliminando producto: ${error.message}`);
      throw new RpcException({
        message: error.message || 'Error eliminando producto',
        statusCode: error.status || 500,
      });
    }
  }

  // Opcional: Health check para el microservicio
  @MessagePattern({ cmd: 'productos.health' })
  async healthCheck() {
    try {
      const count = await this.productsService.countProducts();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        productosCount: count,
      };
    } catch (error) {
      throw new RpcException({
        message: 'Service unhealthy',
        statusCode: 503,
      });
    }
  }
}
