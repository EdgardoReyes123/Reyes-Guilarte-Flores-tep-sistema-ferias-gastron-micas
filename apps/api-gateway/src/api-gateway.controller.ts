import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Headers,
  Query,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';
import { catchError } from 'rxjs';

@Controller('api-gateway/v1')
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('PRODUCTOS_SERVICE') private readonly productosClient: ClientProxy,
  ) {
    // Si esto imprime una clase con métodos como 'send' y 'emit', la inyección fue exitosa
    console.log('Auth Client Inyectado:', this.authClient);
    console.log('Productos Client Inyectado:', this.productosClient);
  }

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
        // Si el DTO falla, aquí verás el array de errores de validación
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

  @Get('auth/health')
  async authHealth() {
    return this.authClient.send({ cmd: 'auth.health' }, {});
  }

  // ========== ENDPOINTS PROTEGIDOS ==========

  @Get('auth/users/:id')
  @UseGuards(AuthGuard) // El guard valida el token internamente
  async getUser(@Param('id') id: string) {
    return this.authClient.send({ cmd: 'auth.getUser' }, { id });
  }

  @Put('auth/users/:id')
  @UseGuards(AuthGuard)
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.authClient.send(
      { cmd: 'auth.updateUser' },
      {
        id,
        updateData,
      },
    );
  }

  // ========== PRODUCTOS (algunos públicos, algunos protegidos) ==========

  @Get('productos')
  async getProductos(@Query() query: any) {
    // Público - cualquiera puede ver productos
    return this.productosClient.send({ cmd: 'getProductos' }, query || {});
  }

  @Get('productos/:id')
  async getProducto(@Param('id') id: string) {
    // Público
    return this.productosClient.send({ cmd: 'getProducto' }, { id });
  }

  @Post('productos')
  @UseGuards(AuthGuard)
  async createProducto(@Body() data: any) {
    // Solo emprendedores/organizadores
    return this.productosClient.send({ cmd: 'createProducto' }, data);
  }

  @Put('productos/:id')
  @UseGuards(AuthGuard)
  async updateProducto(@Param('id') id: string, @Body() data: any) {
    return this.productosClient.send(
      { cmd: 'updateProducto' },
      { id, ...data },
    );
  }

  @Delete('productos/:id')
  @UseGuards(AuthGuard)
  async deleteProducto(@Param('id') id: string) {
    return this.productosClient.send({ cmd: 'deleteProducto' }, { id });
  }
}
