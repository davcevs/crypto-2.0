import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity()
@Index(['wallet', 'symbol'], { unique: true })
export class CryptoHolding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column({
    type: 'decimal', precision: 20, scale: 8, transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value)
    }
  })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  averageBuyPrice: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.holdings)
  wallet: Wallet;
}