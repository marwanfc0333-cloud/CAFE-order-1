import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Printer, Minus, Plus, Trash2, X } from 'lucide-react';
import { Product, OrderItem, AddonCategory, AddonOption } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- Component: Product Card ---

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addProductToOrder } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<OrderItem['selectedAddons']>([]);

  const handleAddonClick = (category: AddonCategory, option: AddonOption) => {
    setSelectedAddons(prev => {
      const existingIndex = prev.findIndex(a => a.categoryName === category.name && a.optionName === option.name);
      
      if (category.isSingleSelect) {
        // Remove all options from this category first
        const filtered = prev.filter(a => a.categoryName !== category.name);
        return [...filtered, { categoryName: category.name, optionName: option.name, priceAdjustment: option.priceAdjustment }];
      } else {
        // Multi-select
        if (existingIndex > -1) {
          return prev.filter((_, index) => index !== existingIndex);
        } else {
          return [...prev, { categoryName: category.name, optionName: option.name, priceAdjustment: option.priceAdjustment }];
        }
      }
    });
  };

  const handleConfirmAdd = () => {
    addProductToOrder(product, selectedAddons);
    setIsDialogOpen(false);
    setSelectedAddons([]);
  };

  const handleProductClick = () => {
    if (product.availableAddons.length > 0) {
      // Open dialog for addons
      setIsDialogOpen(true);
      // Initialize selected addons for single select categories
      const initialAddons: OrderItem['selectedAddons'] = [];
      product.availableAddons.forEach(category => {
        if (category.isSingleSelect && category.options.length > 0) {
          // Select the first option by default (usually the base price option)
          const defaultOption = category.options[0];
          initialAddons.push({
            categoryName: category.name,
            optionName: defaultOption.name,
            priceAdjustment: defaultOption.priceAdjustment,
          });
        }
      });
      setSelectedAddons(initialAddons);
    } else {
      // Add directly
      addProductToOrder(product, []);
    }
  };

  const isAddonSelected = (categoryName: string, optionName: string) => {
    return selectedAddons.some(a => a.categoryName === categoryName && a.optionName === optionName);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

      {/* Addons Dialog */}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">إضافات: {product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {product.availableAddons.map(category => (
            <div key={category.id} className="space-y-3 border-b pb-4">
              <h4 className="text-xl font-bold text-primary">{category.name}</h4>
              
              {category.isSingleSelect ? (
                <RadioGroup 
                  dir="rtl"
                  value={selectedAddons.find(a => a.categoryName === category.name)?.optionName || category.options[0]?.name}
                  onValueChange={(value) => {
                    const option = category.options.find(o => o.name === value);
                    if (option) {
                      handleAddonClick(category, option);
                    }
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  {category.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value={option.name} id={option.id} />
                      <Label htmlFor={option.id} className="flex justify-between w-full text-lg cursor-pointer">
                        <span>{option.name}</span>
                        {option.priceAdjustment !== 0 && (
                          <span className={cn("font-medium", option.priceAdjustment > 0 ? "text-green-600" : "text-red-600")}>
                            {option.priceAdjustment > 0 ? `+${option.priceAdjustment}` : option.priceAdjustment} ر.س
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {category.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <Checkbox
                        id={option.id}
                        checked={isAddonSelected(category.name, option.name)}
                        onCheckedChange={() => handleAddonClick(category, option)}
                      />
                      <Label htmlFor={option.id} className="flex justify-between w-full text-lg cursor-pointer">
                        <span>{option.name}</span>
                        {option.priceAdjustment !== 0 && (
                          <span className={cn("font-medium", option.priceAdjustment > 0 ? "text-green-600" : "text-red-600")}>
                            {option.priceAdjustment > 0 ? `+${option.priceAdjustment}` : option.priceAdjustment} ر.س
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleConfirmAdd} className="w-full h-12 text-lg">
            إضافة إلى الطلب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    // We will use the browser's print function for simulation
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
                  <div className="text-sm text-muted-foreground pr-2">
                    {item.selectedAddons.map((addon, i) => (
                      <span key={i} className="block">
                        - {addon.optionName} ({addon.categoryName})
                        {addon.priceAdjustment !== 0 && ` (${addon.priceAdjustment > 0 ? '+' : ''}${addon.priceAdjustment} ر.س)`}
                      </span>
                    ))}
                  </div>
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
  const { products } = useAppContext();

  return (
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
  );
};

export default Orders;