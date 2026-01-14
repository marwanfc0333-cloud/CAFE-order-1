import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { DataStore } from '../data/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Plus, Trash2, Edit, Save, X, Image, User, ImagePlus, Upload, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Product, Waiter } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockImageUrls } from '../data/mockImages'; // Import mock images
import { Textarea } from '@/components/ui/textarea'; // Import Textarea

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

// --- Component: Image Selector Dialog ---

interface ImageSelectorDialogProps {
    currentImageUrl: string;
    onSelectImage: (url: string) => void;
}

const ImageSelectorDialog: React.FC<ImageSelectorDialogProps> = ({ currentImageUrl, onSelectImage }) => {
    const [open, setOpen] = useState(false);
    const [manualUrl, setManualUrl] = useState(currentImageUrl.startsWith('http') ? currentImageUrl : '');

    const handleSelect = (url: string) => {
        onSelectImage(url);
        setOpen(false);
    };
    
    const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setManualUrl(url);
        onSelectImage(url);
    };

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) { // Limit file size to 500KB for localStorage
                toast.error("حجم الصورة كبير جداً. يرجى اختيار صورة أصغر (أقل من 500 كيلوبايت).");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    onSelectImage(reader.result);
                    toast.success("تم تحميل الصورة بنجاح (Base64).");
                    setOpen(false);
                }
            };
            reader.onerror = () => {
                toast.error("فشل في قراءة ملف الصورة.");
            };
            reader.readAsDataURL(file);
        }
    }, [onSelectImage]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <ImagePlus className="h-4 w-4 ml-2" />
                    اختيار صورة / تحميل
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>اختيار صورة المنتج</DialogTitle>
                </DialogHeader>
                
                {/* File Upload Section */}
                <div className="space-y-2 border p-3 rounded-md">
                    <Label htmlFor="fileUpload" className="font-semibold flex items-center">
                        <Upload className="h-4 w-4 ml-2" />
                        تحميل صورة من جهازك (تخزين محلي)
                    </Label>
                    <Input 
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">سيتم تحويل الصورة إلى نص (Base64) وتخزينها محليًا. يفضل استخدام صور صغيرة.</p>
                </div>

                {/* Manual URL Section */}
                <div className="mt-4 space-y-2">
                    <Label htmlFor="imageUrlManual">أو أدخل رابط URL خارجي:</Label>
                    <Input 
                        id="imageUrlManual"
                        placeholder="https://example.com/image.jpg"
                        value={manualUrl}
                        onChange={handleManualUrlChange}
                        className="mt-1"
                    />
                </div>
                
                {/* Mock Images Section */}
                <h3 className="font-semibold mt-4 border-t pt-4">أو اختر من الصور الافتراضية:</h3>
                <div className="grid grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto p-2">
                    {mockImageUrls.map((url, index) => (
                        <div 
                            key={index} 
                            className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                                currentImageUrl === url ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-gray-300'
                            }`}
                            onClick={() => handleSelect(url)}
                        >
                            <img src={url} alt={`Mock Image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
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

    const handleImageSelect = (url: string) => {
        setProduct({...product, imageUrl: url});
    };

    return (
        <div className="w-full space-y-3 p-2 bg-accent rounded-md">
            <Input 
                placeholder="اسم المنتج" 
                value={product.name} 
                onChange={(e) => setProduct({...product, name: e.target.value})}
            />
            <Input 
                type="number"
                placeholder="السعر (د.إ)" 
                value={product.price} 
                onChange={(e) => setProduct({...product, price: parseFloat(e.target.value) || 0})}
            />
            
            {/* Image Preview and Selector */}
            <div className="flex items-center space-x-3 space-x-reverse">
                <img 
                    src={product.imageUrl} 
                    alt="Product Preview" 
                    className="w-16 h-16 object-cover rounded-md border flex-shrink-0"
                />
                <ImageSelectorDialog 
                    currentImageUrl={product.imageUrl}
                    onSelectImage={handleImageSelect}
                />
            </div>

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
                  <span className="font-medium">{product.name} ({product.price} د.إ)</span>
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

// --- Component: Waiter Edit Form ---

interface WaiterEditFormProps {
    waiter: Waiter;
    onSave: (waiter: Waiter) => void;
    onCancel: () => void;
}

const WaiterEditForm: React.FC<WaiterEditFormProps> = ({ waiter: initialWaiter, onSave, onCancel }) => {
    const [waiter, setWaiter] = useState(initialWaiter);

    return (
        <div className="w-full space-y-3 p-2 bg-accent rounded-md">
            <Input 
                placeholder="اسم النادل" 
                value={waiter.name} 
                onChange={(e) => setWaiter({...waiter, name: e.target.value})}
            />
            <Input 
                type="password"
                placeholder="رمز PIN (4 أرقام)" 
                value={waiter.pin} 
                onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 4) {
                        setWaiter({...waiter, pin: value});
                    }
                }}
                maxLength={4}
                inputMode="numeric"
            />
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button size="sm" onClick={() => onSave(waiter)} disabled={!waiter.name || waiter.pin.length !== 4}>
                    <Save className="h-4 w-4 ml-1" /> حفظ
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 ml-1" /> إلغاء
                </Button>
            </div>
        </div>
    );
};

// --- Component: Waiter Management ---

const WaiterManagement: React.FC<{ refreshData: () => void }> = ({ refreshData }) => {
    const [waiters, setWaiters] = useState<Waiter[]>(DataStore.getWaiters());
    const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const { settings } = useAppContext();

    useEffect(() => {
        setWaiters(DataStore.getWaiters());
    }, [refreshData]);

    const handleSave = (waiter: Waiter) => {
        const currentWaiters = DataStore.getWaiters();
        if (currentWaiters.some(w => w.id === waiter.id)) {
            // Update
            DataStore.setWaiters(currentWaiters.map(w => w.id === waiter.id ? waiter : w));
            toast.success(`تم تحديث النادل: ${waiter.name}`);
        } else {
            // Add new
            DataStore.setWaiters([...currentWaiters, waiter]);
            toast.success(`تم إضافة النادل: ${waiter.name}`);
        }
        setEditingWaiter(null);
        setIsAdding(false);
        refreshData();
    };

    const handleDelete = (id: string, name: string) => {
        if (id === settings.adminPin) {
            toast.error("لا يمكن حذف حساب المدير.");
            return;
        }
        if (window.confirm(`هل أنت متأكد من حذف النادل: ${name}؟`)) {
            const currentWaiters = DataStore.getWaiters();
            DataStore.setWaiters(currentWaiters.filter(w => w.id !== id));
            setWaiters(currentWaiters.filter(w => w.id !== id));
            refreshData();
            toast.info("تم حذف النادل.");
        }
    };

    const handleAddWaiter = () => {
        const newId = `w${Date.now()}`;
        setEditingWaiter({
            id: newId,
            name: '',
            pin: '',
        });
        setIsAdding(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة النُدُل</CardTitle>
                <Button onClick={handleAddWaiter} disabled={isAdding}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة نادل جديد
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {waiters.map(waiter => (
                        <div key={waiter.id} className="border p-3 rounded-lg flex justify-between items-center">
                            {editingWaiter?.id === waiter.id ? (
                                <WaiterEditForm 
                                    waiter={editingWaiter} 
                                    onSave={handleSave} 
                                    onCancel={() => setEditingWaiter(null)} 
                                />
                            ) : (
                                <div className="flex justify-between w-full items-center">
                                    <span className="font-medium flex items-center">
                                        <User className="h-4 w-4 ml-2 text-muted-foreground" />
                                        {waiter.name} 
                                        {waiter.pin === settings.adminPin && <span className="text-xs text-red-500 mr-2">(مدير)</span>}
                                    </span>
                                    <div className="space-x-2 space-x-reverse">
                                        <Button variant="outline" size="icon" onClick={() => setEditingWaiter(waiter)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            onClick={() => handleDelete(waiter.id, waiter.name)}
                                            disabled={waiter.pin === settings.adminPin} // Prevent deleting admin
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isAdding && editingWaiter && (
                        <WaiterEditForm 
                            waiter={editingWaiter} 
                            onSave={handleSave} 
                            onCancel={() => { setEditingWaiter(null); setIsAdding(false); }} 
                        />
                    )}
                </div>
            </CardContent>
        </Card>
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
                
                {/* Print Settings Section */}
                <Card className="p-4 bg-background">
                    <CardTitle className="text-lg mb-3">تخصيص فاتورة الطباعة</CardTitle>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="receiptWidth">عرض الإيصال (بالبكسل، 300px هو العرض القياسي)</Label>
                            <Input 
                                id="receiptWidth"
                                type="number"
                                value={currentSettings.receiptWidth}
                                onChange={(e) => setCurrentSettings({...currentSettings, receiptWidth: parseInt(e.target.value) || 300})}
                                min={200}
                                max={600}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="headerMessage">رسالة رأس الفاتورة (تحت اسم المقهى)</Label>
                            <Input 
                                id="headerMessage"
                                value={currentSettings.headerMessage}
                                onChange={(e) => setCurrentSettings({...currentSettings, headerMessage: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footerMessage">رسالة تذييل الفاتورة (رسالة الشكر)</Label>
                            <Textarea 
                                id="footerMessage"
                                value={currentSettings.footerMessage}
                                onChange={(e) => setCurrentSettings({...currentSettings, footerMessage: e.target.value})}
                                rows={2}
                            />
                        </div>
                    </div>
                </Card>
                
                {/* Wi-Fi Settings Section */}
                <Card className="p-4 bg-background">
                    <CardTitle className="text-lg mb-3 flex items-center">
                        <Wifi className="h-5 w-5 ml-2" />
                        معلومات شبكة الواي فاي (تظهر في الإيصال)
                    </CardTitle>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="wifiSSID">اسم الشبكة (SSID)</Label>
                            <Input 
                                id="wifiSSID"
                                value={currentSettings.wifiSSID}
                                onChange={(e) => setCurrentSettings({...currentSettings, wifiSSID: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wifiPassword">كلمة المرور</Label>
                            <Input 
                                id="wifiPassword"
                                value={currentSettings.wifiPassword}
                                onChange={(e) => setCurrentSettings({...currentSettings, wifiPassword: e.target.value})}
                            />
                        </div>
                    </div>
                </Card>


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
          <WaiterManagement refreshData={refreshData} />
          <ProductManagement products={products} refreshData={refreshData} />
          
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