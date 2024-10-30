// wallet.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { CryptoHolding } from './crypto-holding.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  walletId: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 100000 })
  cashBalance: number;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;

  @OneToMany(() => CryptoHolding, (holding) => holding.wallet)
  holdings: CryptoHolding[];

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
