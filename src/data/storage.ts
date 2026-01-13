import { Order, Product, Waiter } from "../types";

const STORAGE_KEYS = {
  PRODUCTS: "cafe_products",
  WAITERS: "cafe_waiters",
  ORDERS: "cafe_orders",
  SETTINGS: "cafe_settings",
};

// --- General Storage Functions ---

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading storage key ${key}:`, error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing storage key ${key}:`, error);
  }
}

// --- Data Initialization (Mock Data) ---

const initialAddons = [
  {
    id: "size",
    name: "الحجم",
    isSingleSelect: true,
    options: [
      { id: "small", name: "صغير", priceAdjustment: 0 },
      { id: "medium", name: "متوسط", priceAdjustment: 5 },
      { id: "large", name: "كبير", priceAdjustment: 10 },
    ],
  },
  {
    id: "milk",
    name: "الحليب",
    isSingleSelect: true,
    options: [
      { id: "full", name: "كامل الدسم", priceAdjustment: 0 },
      { id: "skim", name: "قليل الدسم", priceAdjustment: 0 },
      { id: "oat", name: "حليب الشوفان", priceAdjustment: 8 },
    ],
  },
  {
    id: "sugar",
    name: "السكر",
    isSingleSelect: false,
    options: [
      { id: "extra_sugar", name: "سكر إضافي", priceAdjustment: 0 },
      { id: "no_sugar", name: "بدون سكر", priceAdjustment: 0 },
    ],
  },
];

const initialProducts: Product[] = [
  {
    id: "p1",
    name: "إسبريسو",
    price: 15,
    imageUrl: "/placeholder.svg",
    availableAddons: initialAddons.filter(a => a.id !== 'size'),
  },
  {
    id: "p2",
    name: "لاتيه",
    price: 22,
    imageUrl: "/placeholder.svg",
    availableAddons: initialAddons,
  },
  {
    id: "p3",
    name: "كابتشينو",
    price: 20,
    imageUrl: "/placeholder.svg",
    availableAddons: initialAddons,
  },
  {
    id: "p4",
    name: "كيك الشوكولاتة",
    price: 30,
    imageUrl: "/placeholder.svg",
    availableAddons: [],
  },
];

const initialWaiters: Waiter[] = [
  { id: "w1", name: "أحمد", pin: "1111" },
  { id: "w2", name: "فاطمة", pin: "2222" },
  { id: "w3", name: "المدير", pin: "0000" }, // Admin PIN
];

const initialSettings = {
  cafeName: "مقهى دياد",
  adminPin: "0000",
  autoPrint: true,
};

// --- Public API ---

export const DataStore = {
  // Products
  getProducts: (): Product[] => getStorageItem(STORAGE_KEYS.PRODUCTS, initialProducts),
  setProducts: (products: Product[]) => setStorageItem(STORAGE_KEYS.PRODUCTS, products),

  // Waiters
  getWaiters: (): Waiter[] => getStorageItem(STORAGE_KEYS.WAITERS, initialWaiters),
  setWaiters: (waiters: Waiter[]) => setStorageItem(STORAGE_KEYS.WAITERS, waiters),

  // Orders
  getOrders: (): Order[] => getStorageItem(STORAGE_KEYS.ORDERS, []),
  saveOrder: (order: Order) => {
    const orders = DataStore.getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex > -1) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }
    setStorageItem(STORAGE_KEYS.ORDERS, orders);
  },
  
  // Settings
  getSettings: () => getStorageItem(STORAGE_KEYS.SETTINGS, initialSettings),
  setSettings: (settings: typeof initialSettings) => setStorageItem(STORAGE_KEYS.SETTINGS, settings),
  
  // Utility
  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.WAITERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    // Re-initialize with defaults
    DataStore.getProducts();
    DataStore.getWaiters();
    DataStore.getSettings();
  }
};