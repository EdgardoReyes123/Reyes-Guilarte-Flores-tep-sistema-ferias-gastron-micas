import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ProductsMicroservice');

  // Crear SOLO microservicio TCP
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', // Accesible desde otros contenedores/hosts
        port: 3004,
        retryAttempts: 5,
        retryDelay: 3000,
      },
    },
  );

  // Opcional: agregar pipes globales si necesitas validación
  // app.useGlobalPipes(new ValidationPipe());

  await app.listen();

  logger.log('=================================');
  logger.log('📡 MICROSERVICIO PRODUCTOS ACTIVO');
  logger.log(`📍 Puerto TCP: 3004`);
  logger.log(`🏷️  Nombre: products-service`);
  logger.log('=================================');
}

bootstrap();
