import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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
        host: '0.0.0.0',
        port: 3001,
        retryAttempts: 5,
        retryDelay: 3000,
      },
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
    }),
  );

  await app.listen();

  logger.log('=================================');
  logger.log('🔐 MICROSERVICIO AUTH - JWT + DTOs');
  logger.log(`📍 Puerto TCP: 3001`);
  logger.log(`✅ Validación: Habilitada`);
  logger.log(`📋 DTOs: RegisterDto, LoginDto, ValidateTokenDto`);
  logger.log('=================================');
}

bootstrap();
