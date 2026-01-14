import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get('customer/:customerId')
  history(@Param('customerId') customerId: string) {
    return this.ordersService.findByCustomer(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Get('stall/:stallId/sales')
  stallSales(@Param('stallId') stallId: string) {
    return this.ordersService.getSalesForStall(stallId);
  }

  @Get()
  listAll() {
    return this.ordersService.listAll();
  }
}
