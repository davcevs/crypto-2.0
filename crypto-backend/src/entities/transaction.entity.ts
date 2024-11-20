// transaction.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity()
export class Transaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty()
  @Column()
  symbol: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  total: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}

