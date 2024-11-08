// transaction.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { CreateTransactionDto } from '../transactions/dtos/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { walletId, type, symbol, amount, price } = createTransactionDto;

    const wallet = await this.walletRepository.findOne({
      where: { walletId: walletId },
      relations: ['holdings'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Calculate total cost
    const totalCost = amount * price;

    // Check if user has enough cash for buying
    if (type === 'BUY' && wallet.cashBalance < totalCost) {
      throw new BadRequestException('Insufficient cash balance');
    }

    // Check if user has enough crypto for selling
    if (type === 'SELL') {
      const holding = wallet.holdings.find((h) => h.symbol === symbol);
      if (!holding || holding.amount < amount) {
        throw new BadRequestException('Insufficient crypto balance');
      }
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      wallet,
      type,
      symbol,
      amount,
      price,
      total: totalCost,
    });

    // Update wallet cash balance
    if (type === 'BUY') {
      wallet.cashBalance = Number(wallet.cashBalance) - totalCost;
    } else {
      wallet.cashBalance = Number(wallet.cashBalance) + totalCost;
    }

    await this.walletRepository.save(wallet);
    return this.transactionRepository.save(transaction);
  }

  async getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { wallet: { walletId: walletId } },
      order: { createdAt: 'DESC' },
      relations: ['wallet'],
    });
  }

  async getTransactionStats(walletId: string) {
    const transactions = await this.getTransactionsByWallet(walletId);

    const stats = {
      totalBought: 0,
      totalSold: 0,
      tradingVolume: 0,
      transactions: transactions.length,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === 'BUY') {
        stats.totalBought += Number(transaction.total);
      } else if (transaction.type === 'SELL') {
        stats.totalSold += Number(transaction.total);
      }
      stats.tradingVolume += Number(transaction.total);
    });

    return stats;
  }
}
