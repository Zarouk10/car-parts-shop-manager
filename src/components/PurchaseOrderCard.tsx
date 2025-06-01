
import React from 'react';
import { Trash2, Edit2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PurchaseOrder {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  notes: string | null;
  purchase_price: number;
  selling_price: number;
  is_purchased: boolean;
  purchase_date: string | null;
  created_at: string;
  user_id: string;
}

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (id: string) => void;
  onMarkAsPurchased: (order: PurchaseOrder) => void;
}

const PurchaseOrderCard: React.FC<PurchaseOrderCardProps> = ({
  order,
  onEdit,
  onDelete,
  onMarkAsPurchased
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} د.ع`;
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border ${order.is_purchased ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight flex-1 ml-2">
            {order.item_name}
            {order.is_purchased && (
              <span className="text-green-600 text-xs mr-2">✓ تم الشراء</span>
            )}
          </h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
            {order.quantity}
          </span>
        </div>

        <div className="mb-3">
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            {order.category}
          </span>
        </div>

        {(order.purchase_price || order.selling_price) && (
          <div className="mb-3 text-xs sm:text-sm text-gray-600">
            {order.purchase_price && (
              <div>سعر الشراء: {formatCurrency(order.purchase_price)}</div>
            )}
            {order.selling_price && (
              <div>سعر البيع: {formatCurrency(order.selling_price)}</div>
            )}
          </div>
        )}
        
        {order.notes && (
          <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed bg-gray-50 p-2 rounded">
            {order.notes}
          </p>
        )}

        {order.is_purchased && order.purchase_date && (
          <p className="text-green-600 text-xs mb-3">
            تاريخ الشراء: {new Date(order.purchase_date).toLocaleDateString('ar-SA')}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString('ar-SA')}
          </span>
          
          <div className="flex gap-2">
            {!order.is_purchased && (
              <Button
                size="sm"
                onClick={() => onMarkAsPurchased(order)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 h-8 w-8"
                title="تم الشراء - نقل إلى المخزون"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(order)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 h-8 w-8 border-blue-200"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(order.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-8 w-8 border-red-200"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseOrderCard;
