import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet;

  @Column({ type: 'enum', enum: ['BUY', 'SELL', 'TRANSFER'] })
  type: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ManyToOne(() => Wallet, { nullable: true })
  toWallet: Wallet;
}