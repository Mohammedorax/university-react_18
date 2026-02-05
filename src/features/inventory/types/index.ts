export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  price: number;
  sku: string;
  min_quantity: number;
  unit: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
}
