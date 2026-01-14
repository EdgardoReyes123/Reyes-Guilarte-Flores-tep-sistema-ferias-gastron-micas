import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ProductsMicroservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3004,
        retryAttempts: 5,
        retryDelay: 3000,
      },
    },
  );

  await app.listen();

  logger.log('=================================');
  logger.log('📡 MICROSERVICIO PRODUCTOS ACTIVO');
  logger.log(`�� Puerto TCP: 3004`);
  logger.log(`🏷️  Nombre: products-service`);
  logger.log(`📊 Patterns: products.create, products.findAll, products.findOne, products.update, products.delete`);
  logger.log('=================================');
}

bootstrap();
