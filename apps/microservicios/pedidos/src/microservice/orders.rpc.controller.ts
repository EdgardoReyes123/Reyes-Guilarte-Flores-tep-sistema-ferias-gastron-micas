import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { OrdersService } from '../modules/orders/orders.service';

@Controller()
export class OrdersRpcController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'orders.create' })
  async create(@Payload() data: any) {
    try {
      return await this.ordersService.create(data);
    } catch (error) {
      throw new RpcException({ message: error.message || 'Error creating order', statusCode: error.status || 500 });
    }
  }

  @MessagePattern({ cmd: 'orders.findByCustomer' })
  async findByCustomer(@Payload() data: any) {
    try {
      const { customerId } = data;
      return await this.ordersService.findByCustomer(customerId);
    } catch (error) {
      throw new RpcException({ message: error.message || 'Error fetching orders', statusCode: error.status || 500 });
    }
  }

  @MessagePattern({ cmd: 'orders.findById' })
  async findById(@Payload() data: any) {
    try {
      const { id } = data;
      return await this.ordersService.findById(id);
    } catch (error) {
      throw new RpcException({ message: error.message || 'Error fetching order', statusCode: error.status || 500 });
    }
  }

  @MessagePattern({ cmd: 'orders.updateStatus' })
  async updateStatus(@Payload() data: any) {
    try {
      const { id, dto } = data;
      return await this.ordersService.updateStatus(id, dto);
    } catch (error) {
      throw new RpcException({ message: error.message || 'Error updating status', statusCode: error.status || 500 });
    }
  }

  @MessagePattern({ cmd: 'orders.getSalesForStall' })
  async getSalesForStall(@Payload() data: any) {
    try {
      const { stallId } = data;
      return await this.ordersService.getSalesForStall(stallId);
    } catch (error) {
      throw new RpcException({ message: error.message || 'Error fetching sales', statusCode: error.status || 500 });
    }
  }

  @MessagePattern({ cmd: 'orders.listAll' })
  async listAll() {
    try {
      return await this.ordersService.listAll();
    } catch (error) {
      throw new RpcException({ message: error.message || 'Error listing orders', statusCode: error.status || 500 });
    }
  }
}
