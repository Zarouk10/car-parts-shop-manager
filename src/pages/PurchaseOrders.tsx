
import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import PurchaseOrderCard from '@/components/PurchaseOrderCard';

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

const PurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const ordersWithDefaults: PurchaseOrder[] = (data || []).map(order => ({
        id: order.id,
        item_name: order.item_name,
        category: order.category || 'عام',
        quantity: order.quantity,
        notes: order.notes,
        purchase_price: order.purchase_price || 0,
        selling_price: order.selling_price || 0,
        is_purchased: order.is_purchased || false,
        purchase_date: order.purchase_date || null,
        created_at: order.created_at,
        user_id: order.user_id
      }));
      
      setOrders(ordersWithDefaults);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب قائمة التسوق",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف العنصر من قائمة التسوق",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العنصر",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleMarkAsPurchased = async (order: PurchaseOrder) => {
    if (order.is_purchased) {
      toast({
        title: "تنبيه",
        description: "هذا العنصر تم شراؤه بالفعل",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('هل تريد نقل هذا العنصر إلى المخزون؟')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: order.item_name,
          category: order.category,
          purchase_price: order.purchase_price || 0,
          selling_price: order.selling_price || 0,
          stock_quantity: order.quantity,
          unit: 'قطعة',
          user_id: user.id
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('purchase_orders')
        .update({
          is_purchased: true,
          purchase_date: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      toast({
        title: "تم النقل بنجاح",
        description: "تم نقل العنصر إلى المخزون مع الاحتفاظ بسجل الشراء",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error marking as purchased:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء نقل العنصر إلى المخزون",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              قائمة التسوق
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              استخدم هذه الصفحة لتدوين الأصناف التي تحتاج لشرائها من السوق. اضغط على علامة ✓ عند الشراء لنقلها إلى المخزون مع الاحتفاظ بسجل الشراء
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-3"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة صنف للقائمة
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {orders.map((order) => (
            <PurchaseOrderCard
              key={order.id}
              order={order}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkAsPurchased={handleMarkAsPurchased}
            />
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-base sm:text-lg mb-2 font-medium">قائمة التسوق فارغة</p>
            <p className="text-gray-500 text-sm sm:text-base">ابدأ بإضافة الأصناف التي تحتاج لشرائها</p>
          </div>
        )}

        <PurchaseOrderForm
          isOpen={isModalOpen}
          onClose={handleFormClose}
          editingOrder={editingOrder}
          onSuccess={fetchOrders}
        />
      </div>
    </div>
  );
};

export default PurchaseOrders;
