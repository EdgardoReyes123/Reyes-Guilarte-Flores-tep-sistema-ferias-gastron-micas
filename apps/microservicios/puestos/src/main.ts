// microservicios/puestos/src/main.ts
import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('PuestosMicroservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3005, // Puerto específico para puestos
        retryAttempts: 5,
        retryDelay: 3000,
      },
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    },
  );

  // Pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // Convierte errores de validación en RpcException
        const errorMessages = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        return new RpcException({
          message: 'Validation failed',
          errors: errorMessages,
          statusCode: 400,
        });
      },
    }),
  );

  // Manejo de excepciones no controladas
  process.on('uncaughtException', (err) => {
    logger.error('❌ Excepción no controlada en Puestos:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Rechazo de promesa no manejado en Puestos:', reason);
  });

  await app.listen();

  logger.log('=================================');
  logger.log('🏪 MICROSERVICIO DE PUESTOS');
  logger.log(`📍 Puerto TCP: 3005`);
  logger.log('=================================');
}

bootstrap().catch((error) => {
  console.error('❌ Error fatal al iniciar microservicio de puestos:', error);
  process.exit(1);
});
