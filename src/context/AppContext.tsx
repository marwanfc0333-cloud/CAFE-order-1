import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Waiter, Order, OrderItem, Product } from '../types';
import { DataStore } from '../data/storage';
import { toast } from 'sonner';

interface AppContextType {
  currentWaiter: Waiter | null;
  currentOrder: Order | null;
  products: Product[];
  settings: { cafeName: string; adminPin: string; autoPrint: boolean };
  
  login: (waiter: Waiter) => void;
  logout: () => void;
  
  addProductToOrder: (product: Product, selectedAddons: OrderItem['selectedAddons']) => void;
  updateOrderItemQuantity: (itemIndex: number, quantity: number) => void;
  removeOrderItem: (itemIndex: number) => void;
  
  submitOrder: () => Promise<void>;
  
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateOrderId = () => `ORD-${Date.now()}`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWaiter, setCurrentWaiter] = useState<Waiter | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>(DataStore.getProducts());
  const [settings, setSettings] = useState(DataStore.getSettings());

  const refreshData = useCallback(() => {
    setProducts(DataStore.getProducts());
    setSettings(DataStore.getSettings());
  }, []);

  const login = (waiter: Waiter) => {
    setCurrentWaiter(waiter);
    // Start a new order for the logged-in waiter
    setCurrentOrder({
      id: generateOrderId(),
      waiterId: waiter.id,
      waiterName: waiter.name,
      items: [],
      totalAmount: 0,
      timestamp: Date.now(),
      isPrinted: false,
    });
    toast.success(`مرحباً بك، ${waiter.name}`);
  };

  const logout = () => {
    setCurrentWaiter(null);
    setCurrentOrder(null);
    toast.info("تم تسجيل الخروج بنجاح");
  };

  const calculateItemPrice = (product: Product, selectedAddons: OrderItem['selectedAddons'], quantity: number) => {
    let total = product.price;
    selectedAddons.forEach(addon => {
      total += addon.priceAdjustment;
    });
    return total * quantity;
  };

  const updateOrderTotal = (order: Order): Order => {
    const totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    return { ...order, totalAmount };
  };

  const addProductToOrder = (product: Product, selectedAddons: OrderItem['selectedAddons']) => {
    if (!currentOrder) return;

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      quantity: 1,
      selectedAddons,
      totalPrice: 0,
    };
    
    newItem.totalPrice = calculateItemPrice(product, selectedAddons, newItem.quantity);

    const updatedItems = [...currentOrder.items, newItem];
    let updatedOrder = { ...currentOrder, items: updatedItems };
    updatedOrder = updateOrderTotal(updatedOrder);
    
    setCurrentOrder(updatedOrder);
    toast.success(`${product.name} أُضيف إلى الطلب`);
  };

  const updateOrderItemQuantity = (itemIndex: number, quantity: number) => {
    if (!currentOrder || quantity <= 0) return;

    const updatedItems = currentOrder.items.map((item, index) => {
      if (index === itemIndex) {
        const product = products.find(p => p.id === item.productId);
        if (!product) return item;
        
        const newTotalPrice = calculateItemPrice(product, item.selectedAddons, quantity);
        return { ...item, quantity, totalPrice: newTotalPrice };
      }
      return item;
    });

    let updatedOrder = { ...currentOrder, items: updatedItems };
    updatedOrder = updateOrderTotal(updatedOrder);
    setCurrentOrder(updatedOrder);
  };

  const removeOrderItem = (itemIndex: number) => {
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.filter((_, index) => index !== itemIndex);
    let updatedOrder = { ...currentOrder, items: updatedItems };
    updatedOrder = updateOrderTotal(updatedOrder);
    setCurrentOrder(updatedOrder);
    toast.info("تم حذف المنتج من الطلب");
  };

  const submitOrder = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      toast.error("الطلب فارغ ولا يمكن تأكيده.");
      return;
    }

    // 1. Save the order
    DataStore.saveOrder(currentOrder);
    
    // 2. Handle printing (We will implement the actual print utility later)
    if (settings.autoPrint) {
        // Placeholder for print logic
        console.log("Auto-printing order:", currentOrder.id);
        // In a real scenario, this would trigger the print utility
    }
    
    toast.success(`تم تأكيد الطلب رقم ${currentOrder.id.split('-')[1]}`);

    // 3. Clear current order and start a new one
    if (currentWaiter) {
        setCurrentOrder({
            id: generateOrderId(),
            waiterId: currentWaiter.id,
            waiterName: currentWaiter.name,
            items: [],
            totalAmount: 0,
            timestamp: Date.now(),
            isPrinted: true, // Mark the old one as printed
        });
    } else {
        setCurrentOrder(null);
    }
  };

  const contextValue = useMemo(() => ({
    currentWaiter,
    currentOrder,
    products,
    settings,
    login,
    logout,
    addProductToOrder,
    updateOrderItemQuantity,
    removeOrderItem,
    submitOrder,
    refreshData,
  }), [currentWaiter, currentOrder, products, settings, refreshData]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};