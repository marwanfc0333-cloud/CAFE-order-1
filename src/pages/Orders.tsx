import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Printer, Minus, Plus, Trash2 } from 'lucide-react';
import { Product, OrderItem } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PrintOrderLayout from '@/components/PrintOrderLayout'; // Import the new component

// --- Component: Product Card ---

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addProductToOrder } = useAppContext();

  const handleProductClick = () => {
    // Direct add since addons are removed
    addProductToOrder(product);
  };

  return (
    <div 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden bg-card border"
      onClick={handleProductClick}
    >
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-32 object-cover"
      />
      <div className="p-3 text-center">
        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
        <p className="text-primary font-bold text-xl mt-1">{product.price} ر.س</p>
      </div>
    </div>
  );
};

// --- Component: Order Ticket ---

const OrderTicket: React.FC = () => {
  const { currentOrder, currentWaiter, updateOrderItemQuantity, removeOrderItem, submitOrder, logout, settings } = useAppContext();
  const navigate = useNavigate();

  const handleQuantityChange = (index: number, delta: number) => {
    if (!currentOrder) return;
    const newQuantity = currentOrder.items[index].quantity + delta;
    if (newQuantity > 0) {
      updateOrderItemQuantity(index, newQuantity);
    } else {
      removeOrderItem(index);
    }
  };

  const handlePrint = () => {
    if (!currentOrder || currentOrder.items.length === 0) {
        toast.error("لا يوجد منتجات في الطلب للطباعة.");
        return;
    }
    // Trigger browser print function
    window.print();
    toast.info("تم إرسال الطلب إلى الطابعة (محاكاة).");
  };

  const handleDailyReport = () => {
    navigate('/daily-report');
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };

  if (!currentOrder) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">ورقة الطلب</CardTitle>
          <p className="text-sm text-muted-foreground">النادل: {currentWaiter?.name}</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="icon" onClick={handleSettings} title="الإعدادات">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={logout} title="تسجيل الخروج">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4 overflow-y-auto space-y-4">
        {currentOrder.items.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>الطلب فارغ. ابدأ بإضافة المنتجات.</p>
          </div>
        ) : (
          currentOrder.items.map((item, index) => (
            <div key={index} className="flex flex-col border-b pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="font-semibold text-lg">{item.productName}</p>
                  {/* Removed Addon display logic */}
                </div>
                <div className="text-right font-bold text-lg min-w-[80px]">
                  {item.totalPrice.toFixed(2)} ر.س
                </div>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center justify-end mt-2 space-x-2 space-x-reverse">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => removeOrderItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(index, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(index, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="flex flex-col p-4 border-t space-y-3">
        <div className="flex justify-between w-full text-2xl font-bold">
          <span>الإجمالي:</span>
          <span>{currentOrder.totalAmount.toFixed(2)} ر.س</span>
        </div>
        
        <Button 
          onClick={submitOrder} 
          disabled={currentOrder.items.length === 0}
          className="w-full h-14 text-xl bg-green-600 hover:bg-green-700"
        >
          تأكيد الطلب والطباعة
        </Button>
        
        <div className="flex w-full space-x-3 space-x-reverse">
            <Button 
                variant="outline" 
                className="flex-1 h-12 text-lg"
                onClick={handlePrint}
                disabled={currentOrder.items.length === 0}
            >
                <Printer className="h-5 w-5 ml-2" />
                طباعة يدوية
            </Button>
            <Button 
                variant="secondary" 
                className="flex-1 h-12 text-lg"
                onClick={handleDailyReport}
            >
                تقرير اليوم
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// --- Main Orders Page ---

const Orders = () => {
  const { products, currentOrder } = useAppContext();

  return (
    <>
      {/* Hidden container for printing */}
      {currentOrder && (
        <div className="print-container">
          <PrintOrderLayout order={currentOrder} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen bg-background">
        {/* Product Grid (2/3 width on large screens) */}
        <div className="lg:col-span-2 p-4 overflow-y-auto">
          <h2 className="text-3xl font-bold mb-4 text-right">قائمة المنتجات</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Order Ticket (1/3 width on large screens) */}
        <div className="lg:col-span-1 border-r bg-sidebar h-screen sticky top-0">
          <OrderTicket />
        </div>
      </div>
    </>
  );
};

export default Orders;