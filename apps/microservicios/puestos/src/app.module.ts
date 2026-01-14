import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puesto } from './entities/puesto.entity';
import { puestosModule } from './modules/stalls/puestos.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: '127.0.0.1',
        port: parseInt(configService.get('DB_PORT', '5434'), 10),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'puestos_service_db'),
        entities: [Puesto],
        synchronize: configService.get('NODE_ENV', 'true') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        // Configuraciones de conexión
        extra: {
          max: 10, // Máximo de conexiones
          connectionTimeoutMillis: 5000,
        },
      }),
      inject: [ConfigService],
    }),

    // Módulo de puestos
    puestosModule,
  ],
})
export class AppModule {}
