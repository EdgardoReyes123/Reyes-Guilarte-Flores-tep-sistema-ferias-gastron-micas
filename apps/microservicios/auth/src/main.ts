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
  const logger = new Logger('AuthMicroservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3002,
        retryAttempts: 5,
        retryDelay: 3000,
      },
      logger: ['log', 'error', 'warn', 'debug', 'verbose'], // <--- ESTO ES VITAL
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
        // Esto convierte el error de validación en algo que el Gateway puede leer
        return new RpcException(errors);
      },
    }),
  );

  process.on('uncaughtException', (err) => {
    console.error('❌ CRASH NO CONTROLADO:', err);
  });

  await app.listen();

  logger.log('=================================');
  logger.log('🔐 MICROSERVICIO AUTH - JWT + DTOs');
  logger.log(`📍 Puerto TCP: 3002`);
  logger.log(`✅ Validación: Habilitada`);
  logger.log(`📋 DTOs: RegisterDto, LoginDto, ValidateTokenDto`);
  logger.log('=================================');
}

bootstrap();
