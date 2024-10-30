import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { CryptoHolding } from '../entities/crypto-holding.entity';
import { BinanceService } from '../binance/binance.service';
import { Transaction } from '../entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { BuySellCryptoDto } from 'src/auth/dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(CryptoHolding)
    private holdingRepository: Repository<CryptoHolding>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private binanceService: BinanceService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    // First check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if wallet already exists
    if (user.wallet) {
      return user.wallet;
    }

    // Create new wallet
    const wallet = this.walletRepository.create({
      cashBalance: 100000,
    });

    // Save the wallet first
    const savedWallet = await this.walletRepository.save(wallet);

    // Update user with wallet reference
    user.wallet = savedWallet;
    await this.userRepository.save(user);

    return savedWallet;
  }

  async getUserWallet(userId: string): Promise<Wallet> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet', 'wallet.holdings'],
    });

    if (!user || !user.wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    return user.wallet;
  }

  async getWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId },
      relations: ['holdings', 'user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async buyCrypto(
    buyCryptoDto: BuySellCryptoDto,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { walletId, symbol, amount } = buyCryptoDto;

      const wallet = await this.walletRepository.findOne({
        where: { walletId },
        relations: ['holdings'],
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const currentPrice = await this.binanceService.getPrice(symbol);

      if (!currentPrice) {
        throw new BadRequestException('Unable to fetch current price');
      }

      const totalCost = currentPrice * amount;

      if (totalCost > wallet.cashBalance) {
        throw new BadRequestException('Insufficient funds');
      }

      let holding = wallet.holdings.find((h) => h.symbol === symbol);
      if (!holding) {
        holding = this.holdingRepository.create({
          symbol,
          amount: 0,
          averageBuyPrice: 0,
          wallet,
        });
      }

      // Update average buy price
      const totalValue =
        holding.amount * holding.averageBuyPrice + amount * currentPrice;
      const newTotalAmount = holding.amount + amount;
      holding.averageBuyPrice = totalValue / newTotalAmount;
      holding.amount = newTotalAmount;

      // Create transaction record
      const transaction = this.transactionRepository.create({
        wallet,
        type: 'BUY',
        symbol,
        amount,
        price: currentPrice,
        total: totalCost,
      });

      // Update wallet balance
      wallet.cashBalance -= totalCost;

      await Promise.all([
        this.holdingRepository.save(holding),
        this.walletRepository.save(wallet),
        this.transactionRepository.save(transaction),
      ]);

      return { success: true };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Buy crypto error:', error);
      throw new BadRequestException(
        'Unable to process your trade at this time. Please try again later.',
      );
    }
  }

  async sellCrypto(
    walletId: string,
    symbol: string,
    amount: number,
  ): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId },
      relations: ['holdings'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const holding = wallet.holdings.find((h) => h.symbol === symbol);
    if (!holding || holding.amount < amount) {
      throw new BadRequestException('Insufficient crypto balance');
    }

    const currentPrice = await this.binanceService.getPrice(symbol);
    const totalValue = currentPrice * amount;

    // Create transaction record
    const transaction = this.transactionRepository.create({
      wallet,
      type: 'SELL',
      symbol,
      amount,
      price: currentPrice,
      total: totalValue,
    });

    // Update holding
    holding.amount -= amount;
    if (holding.amount === 0) {
      await this.holdingRepository.remove(holding);
    } else {
      await this.holdingRepository.save(holding);
    }

    // Update wallet balance
    wallet.cashBalance += totalValue;

    await Promise.all([
      this.walletRepository.save(wallet),
      this.transactionRepository.save(transaction),
    ]);
  }

  async transferCrypto(
    fromWalletId: string,
    toWalletId: string,
    symbol: string,
    amount: number,
  ): Promise<void> {
    const [fromWallet, toWallet] = await Promise.all([
      this.walletRepository.findOne({
        where: { walletId: fromWalletId },
        relations: ['holdings'],
      }),
      this.walletRepository.findOne({
        where: { walletId: toWalletId },
        relations: ['holdings'],
      }),
    ]);

    if (!fromWallet || !toWallet) {
      throw new NotFoundException('Wallet not found');
    }

    const fromHolding = fromWallet.holdings.find((h) => h.symbol === symbol);
    if (!fromHolding || fromHolding.amount < amount) {
      throw new BadRequestException('Insufficient crypto balance');
    }

    let toHolding = toWallet.holdings.find((h) => h.symbol === symbol);
    if (!toHolding) {
      toHolding = this.holdingRepository.create({
        symbol,
        amount: 0,
        averageBuyPrice: fromHolding.averageBuyPrice,
        wallet: toWallet,
      });
    }

    // Update holdings
    fromHolding.amount -= amount;
    toHolding.amount += amount;

    if (fromHolding.amount === 0) {
      await this.holdingRepository.remove(fromHolding);
    } else {
      await this.holdingRepository.save(fromHolding);
    }
    await this.holdingRepository.save(toHolding);
  }

  async getWalletStats(walletId: string): Promise<{
    totalValue: number;
    profitLoss: number;
    holdings: Array<{
      symbol: string;
      amount: number;
      currentPrice: number;
      totalValue: number;
      profitLoss: number;
      profitLossPercentage: number;
    }>;
  }> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId },
      relations: ['holdings'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const holdingsStats = await Promise.all(
      wallet.holdings.map(async (holding) => {
        const currentPrice = await this.binanceService.getPrice(holding.symbol);
        const totalValue = holding.amount * currentPrice;
        const initialValue = holding.amount * holding.averageBuyPrice;
        const profitLoss = totalValue - initialValue;
        const profitLossPercentage = (profitLoss / initialValue) * 100;

        return {
          symbol: holding.symbol,
          amount: holding.amount,
          currentPrice,
          totalValue,
          profitLoss,
          profitLossPercentage,
        };
      }),
    );

    const totalValue = holdingsStats.reduce(
      (sum, holding) => sum + holding.totalValue,
      0,
    );
    const totalProfitLoss = holdingsStats.reduce(
      (sum, holding) => sum + holding.profitLoss,
      0,
    );

    return {
      totalValue,
      profitLoss: totalProfitLoss,
      holdings: holdingsStats,
    };
  }
}
