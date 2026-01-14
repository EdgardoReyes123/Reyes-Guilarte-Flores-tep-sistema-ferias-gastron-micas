import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRpcController } from '../../microservice/orders.rpc.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ClientsModule.register([
      {
        name: 'PRODUCTS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCTS_HOST || 'localhost',
          port: parseInt(process.env.PRODUCTS_TCP_PORT || '3004', 10),
        },
      },
    ]),
  ],
  controllers: [OrdersController, OrdersRpcController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
