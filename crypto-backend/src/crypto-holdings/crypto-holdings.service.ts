// crypto-holdings.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async updateHoldingAmount(
    walletId: string,
    symbol: string,
    newAmount: number,
  ): Promise<CryptoHolding> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    let holding = await this.cryptoHoldingRepository.findOne({
      where: { wallet: { walletId }, symbol },
      relations: ['wallet'],
    });

    if (newAmount === 0) {
      if (holding) {
        await this.cryptoHoldingRepository.remove(holding);
      }
      return null;
    }

    if (!holding) {
      holding = this.cryptoHoldingRepository.create({
        wallet,
        symbol,
        amount: newAmount,
        averageBuyPrice: 0, // You might want to calculate this based on the last transaction
      });
    } else {
      holding.amount = newAmount;
    }

    return await this.cryptoHoldingRepository.save(holding);
  }

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
        throw new BadRequestException(`Insufficient ${symbol} balance`);
      }
      holding.amount -= amount;
    }

    // Save holding or remove if amount is 0
    if (holding.amount === 0) {
      await this.cryptoHoldingRepository.remove(holding);
    } else {
      await this.cryptoHoldingRepository.save(holding);
    }

    // Create and save transaction record
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
    const holdings = await this.cryptoHoldingRepository.find({
      where: { wallet: { walletId } },
      relations: ['wallet'],
    });
    return holdings;
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
      throw new BadRequestException(
        `Insufficient ${symbol} balance. Available: ${holding?.amount || 0}`,
      );
    }

    return true;
  }
}
