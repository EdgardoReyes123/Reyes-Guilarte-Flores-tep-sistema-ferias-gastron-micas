import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Query,
  Request,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';
import { catchError, firstValueFrom } from 'rxjs';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/decorators/roles.decorator';
import { AuthenticatedRequest } from './types/request.types';

@Controller('api-gateway/v1')
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('PRODUCTOS_SERVICE') private readonly productosClient: ClientProxy,
    @Inject('PUESTOS_SERVICE') private readonly puestosClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
  ) {}

  // ========== ENDPOINTS PÚBLICOS ==========

  @Get()
  getInfo() {
    return {
      message: 'API Gateway - Sistema de Ferias Gastronómicas',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('auth/register')
  register(@Body() data: any) {
    return this.authClient.send({ cmd: 'auth.register' }, data).pipe(
      catchError((err) => {
        // Si el DTO falla, aquí se verá el error
        console.log(
          'Detalle del error del Microservicio:',
          JSON.stringify(err, null, 2),
        );
        throw new InternalServerErrorException(err);
      }),
    );
  }

  @Post('auth/login')
  async login(@Body() data: any) {
    return this.authClient.send({ cmd: 'auth.login' }, data);
  }

  // ========== ENDPOINTS PROTEGIDOS ==========

  @Get('auth/users')
  @UseGuards(AuthGuard) // El guard valida el token internamente
  async getUser(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.authClient.send({ cmd: 'auth.getUser' }, { userId });
  }

  @Put('auth/users')
  @UseGuards(AuthGuard)
  async updateUser(
    @Request() req: AuthenticatedRequest,
    @Body() updateData: any,
  ) {
    const id = req.user.id;
    return this.authClient.send(
      { cmd: 'auth.updateUser' },
      {
        id,
        updateData,
      },
    );
  }

  // ----- PUESTOS -----
  @Get('catalogo/puestos')
  async getPuestosActivos() {
    // Ruta pública, sin guards
    return this.puestosClient.send({ cmd: 'puestos.findActivos' }, {});
  }

  @Get('health/puestos')
  async healthCheckPuestos() {
    // Ruta pública, sin guards
    return this.puestosClient.send({ cmd: 'puestos.health' }, {});
  }

  // ========== RUTAS PROTEGIDAS DE PUESTOS ==========

  // ----- CRUD PARA EMPRENDEDORES -----

  @Post('puestos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  async createPuesto(@Body() data: any, @Request() req: AuthenticatedRequest) {
    const payload = {
      ...data,
      ownerId: req.user.id,
      userRole: req.user.role,
    };
    return this.puestosClient.send({ cmd: 'puestos.create' }, payload);
  }

  @Get('puestos/mis-puestos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  async getMisPuestos(@Request() req: AuthenticatedRequest) {
    return this.puestosClient.send(
      { cmd: 'puestos.findByOwner' },
      { ownerId: req.user.id },
    );
  }

  @Get('puestos/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async getPuesto(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.puestosClient.send(
      { cmd: 'puestos.findOne' },
      {
        id,
        userId: req.user.id,
        userRole: req.user.role,
      },
    );
  }

  @Patch('puestos/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  async updatePuesto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any,
    @Request() req: AuthenticatedRequest,
  ) {
    const payload = {
      id,
      ownerId: req.user.id,
      userRole: req.user.role,
      ...data,
    };
    return this.puestosClient.send({ cmd: 'puestos.update' }, payload);
  }

  @Delete('puestos/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  async deletePuesto(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.puestosClient.send(
      { cmd: 'puestos.delete' },
      {
        id,
        userId: req.user.id,
      },
    );
  }

  // ----- ACCIONES PARA ORGANIZADORES -----

  @Get('puestos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPuestos(@Query() filters: any) {
    return this.puestosClient.send({ cmd: 'puestos.findAll' }, filters || {});
  }

  @Patch('puestos/:id/aprobar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async aprobarPuesto(@Param('id', ParseUUIDPipe) id: string) {
    return this.puestosClient.send({ cmd: 'puestos.aprobar' }, { id });
  }

  @Patch('puestos/:id/activar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async activarPuesto(@Param('id', ParseUUIDPipe) id: string) {
    return this.puestosClient.send({ cmd: 'puestos.activar' }, { id });
  }

  // ========== PRODUCTOS (algunos públicos, algunos protegidos) ==========

  @Get('productos')
  async getProductos(@Query() query: any) {
    // Público - cualquiera puede ver productos
    return this.productosClient.send({ cmd: 'getProductos' }, query || {});
  }

  @Get('productos/:id')
  async getProducto(@Param('id', ParseUUIDPipe) id: string) {
    // Público
    return this.productosClient.send({ cmd: 'getProducto' }, { id });
  }

  @Post('productos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller', 'admin') // Solo sellers y admins pueden crear
  async createProducto(@Body() data: any) {
    return this.productosClient.send({ cmd: 'createProducto' }, data);
  }

  @Patch('productos/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller', 'admin') // Solo sellers y admins pueden actualizar
  async updateProducto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any,
  ) {
    return this.productosClient.send(
      { cmd: 'updateProducto' },
      { id, ...data },
    );
  }

  @Delete('productos/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller', 'admin') // Solo sellers y admins pueden eliminar
  async deleteProducto(@Param('id', ParseUUIDPipe) id: string) {
    return this.productosClient.send({ cmd: 'deleteProducto' }, { id });
  }

  @Get('health/productos')
  async healthCheckProductos() {
    return this.productosClient.send({ cmd: 'productos.health' }, {});
  }

  @Post('productos/check-stock')
  async checkStock(@Body() body: any) {
    const { productId, quantity } = body || {};
    if (!productId || typeof quantity !== 'number') {
      throw new BadRequestException('productId y quantity son requeridos');
    }

    return firstValueFrom(
      this.productosClient.send(
        { cmd: 'check_stock' },
        { productId, quantity },
      ),
    );
  }

  @Post('productos/decrement-stock')
  async decrementStock(@Body() body: any) {
    const { productId, quantity } = body || {};
    if (!productId || typeof quantity !== 'number') {
      throw new BadRequestException('productId y quantity son requeridos');
    }

    return firstValueFrom(
      this.productosClient.send(
        { cmd: 'decrement_stock' },
        { productId, quantity },
      ),
    );
  }

  // ========== PEDIDOS / VENTAS ==========

  @Post('orders')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer')
  async createOrder(@Body() body: any, @Request() req: AuthenticatedRequest) {
    const items = body?.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Items son requeridos');
    }

    // Validar cada producto y el puesto
    const validatedItems = [] as any[];
    let stallId: string | null = null;
    for (const it of items) {
      const product = await firstValueFrom(
        this.productosClient.send({ cmd: 'getProducto' }, { id: it.productId }),
      ).catch(() => null);

      if (!product) {
        throw new BadRequestException(`Producto ${it.productId} no encontrado`);
      }

      if (!product.isAvailable || product.stock < it.quantity) {
        throw new BadRequestException(
          `Producto ${product.id} no disponible en la cantidad solicitada`,
        );
      }

      // Validar puesto activo
      const puestoRes = await firstValueFrom(
        this.puestosClient.send(
          { cmd: 'puestos.validateActivo' },
          { puestoId: product.stallId },
        ),
      ).catch(() => null);

      const esActivo = puestoRes?.esActivo ?? false;
      if (!esActivo) {
        throw new BadRequestException(
          `Puesto ${product.stallId} no está activo`,
        );
      }

      if (!stallId) stallId = product.stallId;
      validatedItems.push({
        productId: product.id,
        quantity: it.quantity,
        price: product.price,
        stallId: product.stallId,
      });
    }

    const payload = {
      customerId: req.user.id,
      stallId: stallId,
      items: validatedItems,
    };

    return firstValueFrom(
      this.ordersClient.send({ cmd: 'orders.create' }, payload),
    );
  }

  @Get('orders/my')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer')
  async myOrders(@Request() req: AuthenticatedRequest) {
    return firstValueFrom(
      this.ordersClient.send(
        { cmd: 'orders.findByCustomer' },
        { customerId: req.user.id },
      ),
    );
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard)
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(
      this.ordersClient.send({ cmd: 'orders.findById' }, { id }),
    );
  }

  @Patch('orders/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @Request() req: AuthenticatedRequest,
  ) {
    const status = body?.status;
    if (!status) throw new BadRequestException('Status es requerido');

    return firstValueFrom(
      this.ordersClient.send(
        { cmd: 'orders.updateStatus' },
        { id, dto: { status }, userId: req.user.id, userRole: req.user.role },
      ),
    );
  }

  @Get('orders/stall/:stallId/sales')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async stallSales(@Param('stallId') stallId: string) {
    return firstValueFrom(
      this.ordersClient.send({ cmd: 'orders.getSalesForStall' }, { stallId }),
    );
  }
}
