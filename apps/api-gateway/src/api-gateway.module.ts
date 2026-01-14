import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';

@Module({
  imports: [
    // Configurar comunicación RPC con Auth Service
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002, // Puerto del Auth Service
        },
      },
    ]),
    // Configurar comunicación RPC con Productos Service
    ClientsModule.register([
      {
        name: 'PRODUCTOS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3003, // Puerto del Productos Service
        },
      },
    ]),
    // Configurar comunicación RPC con Puestos Service
    ClientsModule.register([
      {
        name: 'PUESTOS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3005, // Puerto del Puestos Service
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  // NO providers - El gateway no tiene lógica de negocio
})
export class ApiGatewayModule {}
