import React from 'react';
import { Order } from '../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';

interface PrintOrderLayoutProps {
  order: Order;
}

const formatDate = (timestamp: number) => format(timestamp, 'dd/MM/yyyy HH:mm', { locale: ar });

const PrintOrderLayout: React.FC<PrintOrderLayoutProps> = ({ order }) => {
  const { settings } = useAppContext();
  
  return (
    <div className="print-only p-4 text-black bg-white w-[300px] mx-auto text-sm">
      <div className="text-center border-b border-dashed pb-2 mb-2">
        <h1 className="text-xl font-bold mb-1">{settings.cafeName}</h1>
        <p>فاتورة طلب</p>
      </div>

      <div className="text-right mb-2">
        <p>رقم الطلب: <span className="font-semibold">{order.id.split('-')[1]}</span></p>
        <p>النادل: <span className="font-semibold">{order.waiterName}</span></p>
        <p>التاريخ: {formatDate(order.timestamp)}</p>
      </div>

      <table className="w-full text-right border-collapse mb-4">
        <thead>
          <tr className="border-t border-b border-dashed">
            <th className="py-1 px-1 text-right">المنتج</th>
            <th className="py-1 px-1 text-center w-10">الكمية</th>
            <th className="py-1 px-1 text-left w-16">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="py-1 px-1">{item.productName}</td>
              <td className="py-1 px-1 text-center">{item.quantity}</td>
              <td className="py-1 px-1 text-left">{item.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed pt-2">
        <div className="flex justify-between font-bold text-lg">
          <span>الإجمالي الكلي:</span>
          <span>{order.totalAmount.toFixed(2)} ر.س</span>
        </div>
      </div>

      <div className="text-center mt-4 pt-2 border-t border-dashed">
        <p className="text-xs">شكراً لزيارتكم!</p>
      </div>
    </div>
  );
};

export default PrintOrderLayout;