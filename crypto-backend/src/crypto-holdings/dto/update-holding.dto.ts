import { IsNumber, Min } from 'class-validator';

export class UpdateHoldingDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
