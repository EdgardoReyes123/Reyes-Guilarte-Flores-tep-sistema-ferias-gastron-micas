import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products', { schema: 'public' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column({ name: 'stall_id', type: 'uuid' })
  stallId: string;  

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;  

  @Column({ name: 'category', type: 'varchar', length: 100 })
  category: string;  

  @Column({ name: 'stock', type: 'int' })
  stock: number;  

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;  

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}