import { IsNumber, Min } from 'class-validator';

export class UpdateHoldingDto {
  @IsNumber()
  amount: number;
  @IsNumber()
  price: number;
  type: 'BUY' | 'SELL';
}
