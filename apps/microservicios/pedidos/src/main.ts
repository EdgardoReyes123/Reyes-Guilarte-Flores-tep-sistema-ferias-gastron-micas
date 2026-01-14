import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('OrdersMicroservice');

  const app = await NestFactory.create(AppModule);

  // Microservicio TCP para comunicación interna (productos, etc.)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.ORDERS_TCP_PORT || '3011', 10),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  await app.startAllMicroservices();
  await app.listen(parseInt(process.env.ORDERS_HTTP_PORT || '3010', 10));

  logger.log('microservicio de pedidos y ventas esta activo');
  logger.log(`HTTP: ${process.env.ORDERS_HTTP_PORT || 3010}`);
  logger.log(`TCP: ${process.env.ORDERS_TCP_PORT || 3011}`);
}

bootstrap();
