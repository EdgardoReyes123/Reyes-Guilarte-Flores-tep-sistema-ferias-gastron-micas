import { IsString, IsIn } from 'class-validator';

export const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'] as const;

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(ORDER_STATUSES as any)
  status: typeof ORDER_STATUSES[number];
}
