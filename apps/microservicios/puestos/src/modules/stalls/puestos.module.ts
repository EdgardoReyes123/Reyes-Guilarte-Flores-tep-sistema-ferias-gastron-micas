import { Module } from '@nestjs/common';
import { puestosController } from './puestos.controller';
import { puestosService } from './puestos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puesto } from '../../entities/puesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Puesto])],
  controllers: [puestosController],
  providers: [puestosService],
})
export class puestosModule {}
