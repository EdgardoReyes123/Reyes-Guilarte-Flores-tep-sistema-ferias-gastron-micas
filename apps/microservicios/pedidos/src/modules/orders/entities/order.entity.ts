import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  stallId: string;

  @Column({ type: 'jsonb' })
  items: { productId: string; quantity: number }[];

  @Column({ type: 'varchar', length: 20 })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
