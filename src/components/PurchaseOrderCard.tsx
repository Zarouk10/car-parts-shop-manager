
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border ${
      order.is_purchased 
        ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/10' 
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    } shadow-sm hover:shadow-md`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg leading-tight flex-1 ml-2">
            {order.item_name}
            {order.is_purchased && (
              <span className="text-green-600 dark:text-green-400 text-xs mr-2 font-medium">✓ تم الشراء</span>
            )}
          </h3>
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
            {order.quantity}
          </span>
        </div>

        <div className="mb-3">
          <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
            {order.category}
          </span>
        </div>

        {(order.purchase_price || order.selling_price) && (
          <div className="mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {order.purchase_price && (
              <div>سعر الشراء: <span className="font-medium">{formatCurrency(order.purchase_price)}</span></div>
            )}
            {order.selling_price && (
              <div>سعر البيع: <span className="font-medium">{formatCurrency(order.selling_price)}</span></div>
            )}
          </div>
        )}
        
        {order.notes && (
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-100 dark:border-gray-600">
            {order.notes}
          </p>
        )}

        {order.is_purchased && order.purchase_date && (
          <p className="text-green-600 dark:text-green-400 text-xs mb-3 font-medium">
            تاريخ الشراء: {formatDate(order.purchase_date)}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(order.created_at)}
          </span>
          
          <div className="flex gap-2">
            {!order.is_purchased && (
              <Button
                size="sm"
                onClick={() => onMarkAsPurchased(order)}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white p-2 h-8 w-8 transition-colors"
                title="تم الشراء - نقل إلى المخزون"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(order)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 h-8 w-8 border-blue-200 dark:border-blue-700 transition-colors"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(order.id)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-8 w-8 border-red-200 dark:border-red-700 transition-colors"
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
