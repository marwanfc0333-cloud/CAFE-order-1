export interface Product {
  id: string;
  name: string;
  price: number; // Price in local currency unit
  imageUrl: string;
  availableAddons: AddonCategory[];
}

export interface AddonOption {
  id: string;
  name: string;
  priceAdjustment: number; // Can be positive or negative
}

export interface AddonCategory {
  id: string;
  name: string;
  options: AddonOption[];
  isSingleSelect: boolean; // e.g., Size (single select) vs Sugar (multi-select)
}

export interface Waiter {
  id: string;
  name: string;
  pin: string; // Waiter's access code
}

export interface OrderItem {
  productId: string;
  productName: string;
  basePrice: number;
  quantity: number;
  selectedAddons: {
    categoryName: string;
    optionName: string;
    priceAdjustment: number;
  }[];
  totalPrice: number; // Calculated price including quantity and addons
}

export interface Order {
  id: string;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  totalAmount: number;
  timestamp: number; // Unix timestamp
  isPrinted: boolean;
}