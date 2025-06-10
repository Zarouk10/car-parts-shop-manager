
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShoppingCart, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    name: string;
    unit: string;
  };
}

interface Sale {
  id: string;
  sale_date: string;
  total_amount: number;
  sale_items: SaleItem[];
}

interface SalesCardProps {
  sale: Sale;
}

const SalesCard: React.FC<SalesCardProps> = ({ sale }) => {
  const saleDate = new Date(sale.sale_date).toLocaleDateString('ar-SA');

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            عملية بيع #{sale.id.slice(-8)}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {saleDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="font-medium text-green-800">إجمالي المبلغ:</span>
            <span className="text-xl font-bold text-green-600 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(sale.total_amount)}
            </span>
          </div>
          
          {sale.sale_items && sale.sale_items.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 border-b pb-1">تفاصيل المنتجات:</h4>
              {sale.sale_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-medium">
                      {item.products?.name || `منتج غير معروف (${item.product_id.slice(-8)})`}
                    </span>
                    <div className="text-sm text-gray-600">
                      الكمية: {item.quantity} {item.products?.unit || 'قطعة'}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{formatCurrency(item.total_price)}</div>
                    <div className="text-sm text-gray-600">
                      سعر الوحدة: {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-medium">⚠️ لا توجد تفاصيل للمنتجات</p>
              <p className="text-sm">قد تكون هناك مشكلة في ربط البيانات</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesCard;
