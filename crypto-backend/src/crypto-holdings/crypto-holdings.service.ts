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
  ) { }

  async updateHoldingAmount(
    walletId: string,
    symbol: string,
    amount: number,
    price: number,
    type: 'BUY' | 'SELL',
  ): Promise<CryptoHolding> {
    return await this.walletRepository.manager.transaction(async (transactionalEntityManager) => {
      // Lock the wallet for update
      const wallet = await transactionalEntityManager
        .createQueryBuilder(Wallet, 'wallet')
        .where('wallet.walletId = :walletId', { walletId })
        .setLock('pessimistic_write')
        .getOne();

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }

      // Lock the holding for update if it exists
      let holding = await transactionalEntityManager
        .createQueryBuilder(CryptoHolding, 'holding')
        .where('holding.symbol = :symbol', { symbol })
        .andWhere('holding.wallet = :walletId', { walletId })
        .setLock('pessimistic_write')
        .getOne();

      if (!holding && type === 'BUY') {
        // Create new holding if buying for the first time
        holding = this.cryptoHoldingRepository.create({
          wallet,
          symbol,
          amount: 0,
          averageBuyPrice: 0,
        });
      } else if (!holding && type === 'SELL') {
        throw new BadRequestException(`No ${symbol} holdings found to sell`);
      }

      const total = amount * price;

      if (type === 'BUY') {
        // Calculate new average price and total amount
        const oldTotal = holding.amount * holding.averageBuyPrice;
        const newTotal = oldTotal + (amount * price);
        const newAmount = holding.amount + amount;

        holding.amount = newAmount;
        holding.averageBuyPrice = newTotal / newAmount;

        // Update wallet balance
        wallet.cashBalance -= total;
      } else {
        if (holding.amount < amount) {
          throw new BadRequestException(
            `Insufficient ${symbol} balance. Available: ${holding.amount}`,
          );
        }
        holding.amount -= amount;
        wallet.cashBalance += total;
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        wallet,
        type,
        symbol,
        amount,
        price,
        total,
      });

      // Save all changes
      await transactionalEntityManager.save(wallet);
      await transactionalEntityManager.save(transaction);

      if (holding.amount === 0) {
        await transactionalEntityManager.remove(holding);
        return null;
      } else {
        return await transactionalEntityManager.save(holding);
      }
    });
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
    const holdings = await this.cryptoHoldingRepository
      .createQueryBuilder('holding')
      .where('holding.wallet = :walletId', { walletId })
      .orderBy('holding.symbol', 'ASC')
      .getMany();

    return holdings;
  }

  async validateSellAmount(
    walletId: string,
    symbol: string,
    amount: number,
  ): Promise<boolean> {
    const holding = await this.cryptoHoldingRepository
      .createQueryBuilder('holding')
      .where('holding.wallet = :walletId', { walletId })
      .andWhere('holding.symbol = :symbol', { symbol })
      .getOne();

    if (!holding || holding.amount < amount) {
      throw new BadRequestException(
        `Insufficient ${symbol} balance. Available: ${holding?.amount || 0}`,
      );
    }

    return true;
  }
}
