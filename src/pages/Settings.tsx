import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { DataStore } from '../data/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Product, Waiter } from '../types';

// --- Component: Admin PIN Gate ---

const AdminGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  const handleUnlock = () => {
    if (pin === settings.adminPin) {
      setIsUnlocked(true);
      toast.success("تم فتح الإعدادات.");
    } else {
      toast.error("رمز المدير غير صحيح.");
      setPin('');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-center">
            <Lock className="h-6 w-6 ml-2" />
            وصول المدير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="رمز المدير (PIN)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="text-center text-2xl h-12 tracking-[0.5em]"
            inputMode="numeric"
          />
          <Button onClick={handleUnlock} disabled={pin.length !== 4} className="w-full">
            فتح
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Component: Product Management ---

const ProductManagement: React.FC<{ products: Product[]; refreshData: () => void }> = ({ products, refreshData }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (product: Product) => {
    const currentProducts = DataStore.getProducts();
    if (currentProducts.some(p => p.id === product.id)) {
      // Update
      DataStore.setProducts(currentProducts.map(p => p.id === product.id ? product : p));
      toast.success(`تم تحديث المنتج: ${product.name}`);
    } else {
      // Add new
      DataStore.setProducts([...currentProducts, product]);
      toast.success(`تم إضافة المنتج: ${product.name}`);
    }
    setEditingProduct(null);
    setIsAdding(false);
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const currentProducts = DataStore.getProducts();
      DataStore.setProducts(currentProducts.filter(p => p.id !== id));
      refreshData();
      toast.info("تم حذف المنتج.");
    }
  };

  const handleAddProduct = () => {
    const newId = `p${Date.now()}`;
    setEditingProduct({
      id: newId,
      name: '',
      price: 0,
      imageUrl: '/placeholder.svg',
    });
    setIsAdding(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إدارة المنتجات</CardTitle>
        <Button onClick={handleAddProduct} disabled={isAdding}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج جديد
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="border p-3 rounded-lg flex justify-between items-center">
              {editingProduct?.id === product.id ? (
                <ProductEditForm 
                  product={editingProduct} 
                  onSave={handleSave} 
                  onCancel={() => setEditingProduct(null)} 
                />
              ) : (
                <div className="flex justify-between w-full items-center">
                  <span className="font-medium">{product.name} ({product.price} ر.س)</span>
                  <div className="space-x-2 space-x-reverse">
                    <Button variant="outline" size="icon" onClick={() => setEditingProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isAdding && editingProduct && (
             <ProductEditForm 
                product={editingProduct} 
                onSave={handleSave} 
                onCancel={() => { setEditingProduct(null); setIsAdding(false); }} 
              />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Component: Product Edit Form (Simplified) ---

interface ProductEditFormProps {
    product: Product;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ product: initialProduct, onSave, onCancel }) => {
    const [product, setProduct] = useState(initialProduct);

    return (
        <div className="w-full space-y-3 p-2 bg-accent rounded-md">
            <Input 
                placeholder="اسم المنتج" 
                value={product.name} 
                onChange={(e) => setProduct({...product, name: e.target.value})}
            />
            <Input 
                type="number"
                placeholder="السعر (ر.س)" 
                value={product.price} 
                onChange={(e) => setProduct({...product, price: parseFloat(e.target.value) || 0})}
            />
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button size="sm" onClick={() => onSave(product)} disabled={!product.name || product.price <= 0}>
                    <Save className="h-4 w-4 ml-1" /> حفظ
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 ml-1" /> إلغاء
                </Button>
            </div>
        </div>
    );
};


// --- Component: General Settings ---

const GeneralSettings: React.FC<{ settings: any; refreshData: () => void }> = ({ settings: initialSettings, refreshData }) => {
    const [currentSettings, setCurrentSettings] = useState(initialSettings);

    const handleSave = () => {
        DataStore.setSettings(currentSettings);
        refreshData();
        toast.success("تم حفظ الإعدادات العامة.");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cafeName">اسم المقهى</Label>
                    <Input 
                        id="cafeName"
                        value={currentSettings.cafeName}
                        onChange={(e) => setCurrentSettings({...currentSettings, cafeName: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adminPin">رمز المدير (PIN)</Label>
                    <Input 
                        id="adminPin"
                        type="password"
                        value={currentSettings.adminPin}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 4) {
                                setCurrentSettings({...currentSettings, adminPin: value});
                            }
                        }}
                        maxLength={4}
                        inputMode="numeric"
                    />
                </div>
                <div className="flex items-center justify-between space-x-2 space-x-reverse p-2 border rounded-md">
                    <Label htmlFor="autoPrint">الطباعة التلقائية عند تأكيد الطلب</Label>
                    <Switch
                        id="autoPrint"
                        checked={currentSettings.autoPrint}
                        onCheckedChange={(checked) => setCurrentSettings({...currentSettings, autoPrint: checked})}
                    />
                </div>
                <Button onClick={handleSave} className="w-full">حفظ الإعدادات</Button>
            </CardContent>
        </Card>
    );
};


// --- Main Settings Page ---

const SettingsPage = () => {
  const navigate = useNavigate();
  const { products, settings, refreshData } = useAppContext();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للطلبات
        </Button>
        <h1 className="text-3xl font-bold">إعدادات المدير</h1>
      </div>

      <AdminGate>
        <div className="space-y-6">
          <GeneralSettings settings={settings} refreshData={refreshData} />
          <ProductManagement products={products} refreshData={refreshData} />
          {/* Waiter Management is omitted for brevity but would follow the same pattern */}
          <Card>
            <CardHeader>
                <CardTitle>إعدادات الطابعة (محاكاة)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">في تطبيق الويب، نستخدم وظيفة طباعة المتصفح (Window.print()). للاتصال المباشر بطابعات Bluetooth/WiFi، ستحتاج إلى تطبيق أصلي أو خدمة وسيطة.</p>
                <Button onClick={() => toast.info("تم محاكاة إعداد الطابعة بنجاح.")} className="mt-4">
                    اختبار الطباعة
                </Button>
            </CardContent>
          </Card>
        </div>
      </AdminGate>
    </div>
  );
};

export default SettingsPage;