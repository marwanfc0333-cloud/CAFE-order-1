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

// الإضافات محذوفة بناءً على طلب المستخدم

const initialProducts: Product[] = [
  {
    id: "p1",
    name: "إسبريسو",
    price: 15,
    imageUrl: "/placeholder.svg",
  },
  {
    id: "p2",
    name: "لاتيه",
    price: 22,
    imageUrl: "/placeholder.svg",
  },
  {
    id: "p3",
    name: "كابتشينو",
    price: 20,
    imageUrl: "/placeholder.svg",
  },
  {
    id: "p4",
    name: "كيك الشوكولاتة",
    price: 30,
    imageUrl: "/placeholder.svg",
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
  headerMessage: "فاتورة طلب",
  footerMessage: "شكراً لزيارتكم!",
  wifiSSID: "DyadCafe_Guest", // New setting
  wifiPassword: "password123", // New setting
  receiptWidth: 300, // New setting (in pixels)
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
  setOrders: (orders: Order[]) => setStorageItem(STORAGE_KEYS.ORDERS, orders), // FIX: Added setOrders
  
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