import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
    private dataSource: DataSource,
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
    const { userId, symbol, amount } = buyCryptoDto;
    console.log('Starting buy crypto operation:', { userId, symbol, amount });

    return await this.walletRepository.manager.transaction(async (transactionalEntityManager) => {
      // 1. Get user with wallet
      const user = await transactionalEntityManager
        .createQueryBuilder(User, 'user')
        .leftJoinAndSelect('user.wallet', 'wallet')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user?.wallet) {
        throw new NotFoundException(`No wallet found for user ${userId}`);
      }

      // 2. Lock and get the wallet
      const wallet = await transactionalEntityManager
        .createQueryBuilder(Wallet, 'wallet')
        .where('wallet.walletId = :walletId', { walletId: user.wallet.walletId })
        .setLock('pessimistic_write')
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // 3. Get current price from Binance
      const currentPrice = await this.binanceService.getPrice(symbol);
      if (!currentPrice) {
        throw new BadRequestException('Unable to fetch current price');
      }

      // 4. Calculate total cost with proper decimal handling
      const totalCost = parseFloat((currentPrice * amount).toFixed(8));
      const walletBalance = parseFloat(wallet.cashBalance.toString());

      if (totalCost > walletBalance) {
        throw new BadRequestException(
          `Insufficient funds. Required: ${totalCost}, Available: ${walletBalance}`,
        );
      }

      // 5. Get or create holding with lock
      let holding = await transactionalEntityManager
        .createQueryBuilder(CryptoHolding, 'holding')
        .where('holding.wallet = :walletId AND holding.symbol = :symbol', {
          walletId: wallet.walletId,
          symbol,
        })
        .setLock('pessimistic_write')
        .getOne();

      if (!holding) {
        // Create new holding
        holding = this.holdingRepository.create({
          symbol,
          amount: amount,
          averageBuyPrice: currentPrice,
          wallet,
        });
      } else {
        // Update existing holding with proper decimal handling
        const existingAmount = parseFloat(holding.amount.toString());
        const existingPrice = parseFloat(holding.averageBuyPrice.toString());

        const totalValue = (existingAmount * existingPrice) + (amount * currentPrice);
        const newTotalAmount = existingAmount + amount;

        holding.amount = parseFloat(newTotalAmount.toFixed(8));
        holding.averageBuyPrice = parseFloat((totalValue / newTotalAmount).toFixed(8));
      }

      // 6. Create transaction record
      const transaction = this.transactionRepository.create({
        wallet,
        type: 'BUY',
        symbol,
        amount,
        price: currentPrice,
        total: totalCost,
      });

      // 7. Update wallet balance with proper decimal handling
      wallet.cashBalance = parseFloat((walletBalance - totalCost).toFixed(8));

      // 8. Save everything
      try {
        // Save the holding first
        const savedHolding = await transactionalEntityManager.save(CryptoHolding, holding);
        console.log('Saved holding:', savedHolding);

        // Then save wallet and transaction
        await transactionalEntityManager.save(Wallet, wallet);
        await transactionalEntityManager.save(Transaction, transaction);

        console.log('Buy operation completed successfully', {
          symbol,
          amount,
          newBalance: wallet.cashBalance,
          newHoldingAmount: savedHolding.amount,
        });

        return { success: true };
      } catch (error) {
        console.error('Error during buy operation:', error);
        throw new BadRequestException(`Failed to complete buy operation: ${error.message}`);
      }
    });
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
    recipient: string,
    symbol: string,
    amount: number
  ) {
    // Start a transaction using DataSource
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find sender's wallet with user relation
      const fromWallet = await this.walletRepository.findOne({
        where: { walletId: fromWalletId },
        relations: ['holdings', 'user']
      });

      if (!fromWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      // Find recipient by username or email
      const recipientUser = await this.userRepository.findOne({
        where: [
          { username: recipient.trim() },
          { email: recipient.trim() }
        ],
        relations: ['wallet']
      });

      if (!recipientUser || !recipientUser.wallet) {
        throw new NotFoundException('Recipient user not found');
      }

      // Prevent self-transfer
      if (fromWallet.user.id === recipientUser.id) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      // Find sender's holding
      const fromHolding = await this.holdingRepository.findOne({
        where: {
          wallet: fromWallet,
          symbol: symbol.toUpperCase()
        }
      });

      if (!fromHolding) {
        throw new BadRequestException(`You do not hold any ${symbol}`);
      }

      // Validate transfer amount
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new BadRequestException('Invalid transfer amount');
      }

      if (fromHolding.amount < parsedAmount) {
        throw new BadRequestException(`Insufficient ${symbol} balance`);
      }

      // Find or create recipient's holding
      let toHolding = await this.holdingRepository.findOne({
        where: {
          wallet: recipientUser.wallet,
          symbol: symbol.toUpperCase()
        }
      });

      if (!toHolding) {
        toHolding = this.holdingRepository.create({
          symbol: symbol.toUpperCase(),
          amount: 0,
          wallet: recipientUser.wallet,
          averageBuyPrice: fromHolding.averageBuyPrice
        });
      }

      // Precise decimal handling
      fromHolding.amount = parseFloat((fromHolding.amount - parsedAmount).toFixed(8));
      toHolding.amount = parseFloat((toHolding.amount + parsedAmount).toFixed(8));

      // Fetch current market price for transaction record
      const currentPrice = await this.binanceService.getPrice(symbol);

      // Create transaction record
      const transaction = this.transactionRepository.create({
        wallet: fromWallet,
        toWallet: recipientUser.wallet,
        type: 'TRANSFER',
        symbol: symbol.toUpperCase(),
        amount: parsedAmount,
        price: currentPrice,
        total: parsedAmount * currentPrice,
        description: `Transfer to ${recipientUser.username || recipientUser.email}`
      });

      // Save holdings and transaction
      await this.holdingRepository.save([fromHolding, toHolding]);
      await this.transactionRepository.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Transferred ${parsedAmount} ${symbol} to ${recipientUser.username || recipientUser.email}`
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();

      // Log the full error for debugging
      console.error('Transfer Crypto Error:', error);

      throw new BadRequestException(
        error.message || 'Transfer failed. Please try again.'
      );
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
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


