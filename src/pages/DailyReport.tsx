import React, { useMemo, useState } from 'react';
import { DataStore } from '../data/storage';
import { Order, Waiter } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

// Helper function to format date/time
const formatDate = (timestamp: number) => format(timestamp, 'dd/MM/yyyy HH:mm', { locale: ar });

const DailyReport = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(DataStore.getOrders());
  const [waiters, setWaiters] = useState<Waiter[]>(DataStore.getWaiters());

  const { totalSales, totalOrders, salesByWaiter } = useMemo(() => {
    const salesByWaiter: { [key: string]: { name: string; total: number; count: number } } = {};
    let totalSales = 0;
    let totalOrders = orders.length;

    const waiterMap = new Map(waiters.map(w => [w.id, w.name]));

    orders.forEach(order => {
      totalSales += order.totalAmount;
      const waiterId = order.waiterId;
      const waiterName = waiterMap.get(waiterId) || 'غير معروف';

      if (!salesByWaiter[waiterId]) {
        salesByWaiter[waiterId] = { name: waiterName, total: 0, count: 0 };
      }
      salesByWaiter[waiterId].total += order.totalAmount;
      salesByWaiter[waiterId].count += 1;
    });

    return { totalSales, totalOrders, salesByWaiter };
  }, [orders, waiters]);

  const handlePrintReport = () => {
    // Use browser print function for report simulation
    window.print();
    toast.info("تم إرسال تقرير اليوم إلى الطابعة (محاكاة).");
  };

  const handleClearData = () => {
    if (window.confirm("هل أنت متأكد من حذف جميع بيانات الطلبات؟ لا يمكن التراجع عن هذا الإجراء.")) {
      DataStore.setOrders([]); // FIX: Corrected function call
      setOrders([]);
      toast.success("تم حذف جميع الطلبات بنجاح.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للطلبات
        </Button>
        <h1 className="text-3xl font-bold">تقرير المبيعات اليومي</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">ملخص الإجمالي</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-xl">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">إجمالي المبيعات:</span>
            <span className="font-bold text-green-600">{totalSales.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">عدد الطلبات:</span>
            <span className="font-bold">{totalOrders}</span>
          </div>
          <div className="col-span-2 pt-4">
            <h3 className="text-xl font-semibold mb-2">تفصيل حسب النادل:</h3>
            {Object.values(salesByWaiter).map(waiter => (
              <div key={waiter.name} className="flex justify-between text-lg py-1 border-b border-dashed">
                <span>{waiter.name} ({waiter.count} طلب):</span>
                <span className="font-semibold">{waiter.total.toFixed(2)} ر.س</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4 space-x-reverse mb-6">
        <Button onClick={handlePrintReport} className="flex-1 h-12 text-lg">
          <Printer className="h-5 w-5 ml-2" />
          طباعة التقرير
        </Button>
        <Button onClick={handleClearData} variant="destructive" className="h-12 text-lg">
          <Trash2 className="h-5 w-5 ml-2" />
          حذف بيانات الطلبات
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">سجل الطلبات ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice().reverse().map(order => (
              <div key={order.id} className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between font-bold border-b pb-1 mb-2">
                  <span>رقم الطلب: {order.id.split('-')[1]}</span>
                  <span>{order.totalAmount.toFixed(2)} ر.س</span>
                </div>
                <p className="text-sm text-muted-foreground">النادل: {order.waiterName} | التاريخ: {formatDate(order.timestamp)}</p>
                <ul className="list-disc pr-6 mt-2 text-sm">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.productName} x{item.quantity} ({item.totalPrice.toFixed(2)} ر.س)
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReport;