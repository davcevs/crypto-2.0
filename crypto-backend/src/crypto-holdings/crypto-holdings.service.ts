// crypto-holdings.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoHolding } from '../entities/crypto-holding.entity';
import { Transaction } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class CryptoHoldingsService {
  constructor(
    @InjectRepository(CryptoHolding)
    private cryptoHoldingRepository: Repository<CryptoHolding>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async updateHoldings(
    wallet: Wallet,
    symbol: string,
    amount: number,
    price: number,
    type: 'BUY' | 'SELL',
  ): Promise<void> {
    let holding = await this.cryptoHoldingRepository.findOne({
      where: { wallet: { walletId: wallet.walletId }, symbol },
    });

    if (type === 'BUY') {
      if (!holding) {
        holding = this.cryptoHoldingRepository.create({
          wallet,
          symbol,
          amount: 0,
          averageBuyPrice: 0,
        });
      }

      const totalCurrentValue = holding.amount * holding.averageBuyPrice;
      const newValue = amount * price;
      const totalAmount = holding.amount + amount;
      const newAveragePrice = (totalCurrentValue + newValue) / totalAmount;

      holding.amount = totalAmount;
      holding.averageBuyPrice = newAveragePrice;
    } else if (type === 'SELL') {
      if (!holding || holding.amount < amount) {
        throw new Error(`Insufficient ${symbol} balance`);
      }

      holding.amount -= amount;
    }

    if (holding.amount === 0) {
      await this.cryptoHoldingRepository.remove(holding);
    } else {
      await this.cryptoHoldingRepository.save(holding);
    }

    const transaction = this.transactionRepository.create({
      wallet,
      type,
      symbol,
      amount,
      price,
      total: amount * price,
    });

    await this.transactionRepository.save(transaction);
  }

  async getHoldings(walletId: string): Promise<CryptoHolding[]> {
    return this.cryptoHoldingRepository.find({
      where: { wallet: { walletId } }, // Correctly reference walletId
      relations: ['wallet'], // Include wallet relationship if needed
    });
  }

  // Correct implementation for getTransactionHistory
  async getTransactionHistory(walletId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { wallet: { walletId } }, // Correctly reference walletId
      relations: ['wallet'], // Include wallet relationship if needed
      order: { id: 'DESC' }, // Sort transactions by most recent
    });
  }

  async validateSellAmount(
    walletId: string,
    symbol: string,
    amount: number,
  ): Promise<boolean> {
    const holding = await this.cryptoHoldingRepository.findOne({
      where: { wallet: { walletId }, symbol },
    });

    if (!holding || holding.amount < amount) {
      throw new Error(
        `Insufficient ${symbol} balance. Available: ${holding?.amount || 0}`,
      );
    }

    return true;
  }
}
