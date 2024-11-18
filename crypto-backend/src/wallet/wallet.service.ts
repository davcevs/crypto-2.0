import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { CryptoHolding } from '../entities/crypto-holding.entity';
import { BinanceService } from '../binance/binance.service';
import { Transaction } from '../entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { BuySellCryptoDto } from 'src/auth/dto/wallet.dto';
import { CryptoHoldingsService } from 'src/crypto-holdings/crypto-holdings.service';

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
    @InjectRepository(CryptoHolding)
    private readonly cryptoHoldingsService: CryptoHoldingsService,
  ) { }

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

      // Find or create holding
      let holding = wallet.holdings.find((h) => h.symbol === symbol);
      if (!holding) {
        holding = this.holdingRepository.create({
          symbol,
          amount: 0,
          averageBuyPrice: 0,
          wallet,
        });
        wallet.holdings.push(holding); // Add to wallet's holdings array
      }

      // Update holding
      const totalValue = holding.amount * holding.averageBuyPrice + amount * currentPrice;
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

      // Save everything in a transaction
      await this.walletRepository.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(holding);
        await transactionalEntityManager.save(wallet);
        await transactionalEntityManager.save(transaction);
      });

      return { success: true };
    } catch (error) {
      console.error('Buy crypto error:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
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
    console.log('Starting sellCrypto method');

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

    console.log(`Holding found: ${JSON.stringify(holding)}`);

    // Fetch the current price from Binance
    let currentPrice = await this.binanceService.getPrice(symbol);

    console.log(`Raw currentPrice from Binance: ${currentPrice}`);

    // Ensure currentPrice is a valid number and sanitize it
    currentPrice = parseFloat(currentPrice.toString().replace(/[^\d.-]/g, ''));

    console.log(`Sanitized currentPrice: ${currentPrice}`);

    // Check if currentPrice is valid
    if (isNaN(currentPrice)) {
      throw new BadRequestException('Invalid price retrieved from Binance');
    }

    // Round the price to avoid extra decimals (2 decimal places)
    currentPrice = Math.round(currentPrice * 100) / 100;

    console.log(`Rounded currentPrice: ${currentPrice}`);

    // Ensure the amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount value');
    }

    console.log(`Amount to sell: ${amount}`);

    // Calculate total value, rounded to 2 decimal places
    const totalValue = parseFloat((currentPrice * amount).toFixed(2));

    console.log(`Calculated totalValue: ${totalValue}`);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      wallet,
      type: 'SELL',
      symbol,
      amount,
      price: currentPrice,
      total: totalValue,
    });

    console.log(`Transaction created: ${JSON.stringify(transaction)}`);

    // Update holding
    holding.amount -= amount;
    if (holding.amount === 0) {
      await this.holdingRepository.remove(holding);
    } else {
      await this.holdingRepository.save(holding);
    }

    // Update wallet balance (convert cashBalance to a number before adding)
    const currentCashBalance = parseFloat(wallet.cashBalance.toString());
    if (isNaN(currentCashBalance)) {
      throw new BadRequestException('Invalid wallet cash balance');
    }

    // Add the totalValue to the current cash balance
    // Update wallet balance
    const updatedCashBalance = currentCashBalance + totalValue;

    console.log(`Updated wallet cash balance: ${updatedCashBalance}`);

    // Save both the updated wallet and transaction records
    wallet.cashBalance = parseFloat(updatedCashBalance.toFixed(2)); // Convert to number
    await Promise.all([
      this.walletRepository.save(wallet),
      this.transactionRepository.save(transaction),
    ]);
    ;

    console.log('sellCrypto method completed successfully');
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
