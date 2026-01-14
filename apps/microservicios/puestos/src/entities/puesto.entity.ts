// microservicios/puestos/src/puestos/entities/puesto.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PuestoStatus } from '../interfaces/puesto.interface';

@Entity('stalls')
@Index(['ownerId', 'status']) // Índice para búsquedas comunes
export class Puesto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({
    type: 'enum',
    enum: PuestoStatus,
    default: PuestoStatus.PENDIENTE,
  })
  status: PuestoStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos helper
  puedeSerAprobado(): boolean {
    return this.status === PuestoStatus.PENDIENTE;
  }

  puedeSerActivado(): boolean {
    return this.status === PuestoStatus.APROBADO;
  }

  puedeSerEditadoPorEmprendedor(): boolean {
    return (
      this.status === PuestoStatus.PENDIENTE ||
      this.status === PuestoStatus.APROBADO
    );
  }

  esActivo(): boolean {
    return this.status === PuestoStatus.ACTIVO;
  }
}
