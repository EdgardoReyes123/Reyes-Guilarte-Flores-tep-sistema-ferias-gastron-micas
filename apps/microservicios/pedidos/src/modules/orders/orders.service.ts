import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  UpdateOrderStatusDto,
  ORDER_STATUSES,
} from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.productsClient.connect();
    } catch (e) {
      this.logger.warn(
        'No se pudo conectar a PRODUCTS_SERVICE en inicio (posible entorno local)',
      );
    }
  }
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Verificar disponibilidad para cada producto
    for (const item of createOrderDto.items) {
      const available = await firstValueFrom(
        this.productsClient.send(
          { cmd: 'check_stock' },
          {
            productId: item.productId,
            quantity: item.quantity,
          },
        ),
      ).catch(() => null);

      if (!available || (available && !available.available)) {
        throw new BadRequestException(
          `Producto ${item.productId} no disponible en la cantidad solicitada`,
        );
      }
    }

    // Reservar/actualizar stock (decremento)
    for (const item of createOrderDto.items) {
      await firstValueFrom(
        this.productsClient.send(
          { cmd: 'decrement_stock' },
          {
            productId: item.productId,
            quantity: item.quantity,
          },
        ),
      ).catch(() => null);
    }

    const order = this.ordersRepository.create({
      customerId: createOrderDto.customerId,
      stallId: createOrderDto.stallId,
      items: createOrderDto.items,
      status: 'PENDING',
    });

    return await this.ordersRepository.save(order);
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Order> {
    const o = await this.ordersRepository.findOne({ where: { id } });
    if (!o) throw new NotFoundException('Pedido no encontrado');
    return o;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);

    const allowed = ORDER_STATUSES as unknown as string[];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException('Estado no permitido');
    }

    const orderIndex = allowed.indexOf(order.status);
    const newIndex = allowed.indexOf(dto.status);
    if (newIndex < orderIndex) {
      throw new BadRequestException(
        'No se permite retroceder el estado del pedido',
      );
    }

    order.status = dto.status as any;
    const saved = await this.ordersRepository.save(order);
    return saved;
  }

  async getSalesForStall(stallId: string) {
    const delivered = await this.ordersRepository.find({
      where: { stallId, status: 'DELIVERED' },
    });
    const itemsSold = delivered.reduce(
      (sum, o) => sum + o.items.reduce((s, it) => s + (it.quantity || 0), 0),
      0,
    );
    return { stallId, itemsSold };
  }

  async listAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }
}
