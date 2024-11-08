// transaction.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsIn } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Wallet ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  walletId: string;

  @ApiProperty({
    description: 'Transaction type',
    example: 'BUY',
    enum: ['BUY', 'SELL'],
  })
  @IsString()
  @IsIn(['BUY', 'SELL'])
  type: string;

  @ApiProperty({ description: 'Crypto symbol', example: 'BTC' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Transaction amount', example: 1.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Crypto price', example: 50000 })
  @IsNumber()
  price: number;
}
