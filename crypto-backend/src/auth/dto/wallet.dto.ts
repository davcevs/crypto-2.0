// wallet.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';

export class BuySellCryptoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;
}

export class TransferCryptoDto extends BuySellCryptoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toWalletId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsString()
  @IsPositive()
  amount: number;
}
