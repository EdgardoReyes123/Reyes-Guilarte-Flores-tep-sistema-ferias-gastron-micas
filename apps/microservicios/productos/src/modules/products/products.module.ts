import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller'; // SOLO este controlador

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController], // Solo el controlador TCP
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}