export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  description: string;
  active: boolean;
}
