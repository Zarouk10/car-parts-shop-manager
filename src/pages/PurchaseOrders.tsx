
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ShoppingCart, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PurchaseOrder {
  id: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  created_at: string;
}

const PurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: '',
    notes: ''
  });
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
      setOrders(data || []);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      if (editingOrder) {
        // تحديث العنصر
        const { error } = await supabase
          .from('purchase_orders')
          .update({
            item_name: formData.item_name,
            quantity: parseInt(formData.quantity),
            notes: formData.notes || null
          })
          .eq('id', editingOrder.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث العنصر بنجاح",
        });
      } else {
        // إضافة عنصر جديد
        const { error } = await supabase
          .from('purchase_orders')
          .insert({
            item_name: formData.item_name,
            quantity: parseInt(formData.quantity),
            notes: formData.notes || null,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة العنصر لقائمة التسوق",
        });
      }

      // إعادة تعيين النموذج
      setFormData({ item_name: '', quantity: '', notes: '' });
      setEditingOrder(null);
      setIsModalOpen(false);
      
      // إعادة جلب البيانات
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ العنصر",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setFormData({
      item_name: order.item_name,
      quantity: order.quantity.toString(),
      notes: order.notes || ''
    });
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

  const OrderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="item_name">اسم الصنف</Label>
        <Input
          id="item_name"
          name="item_name"
          value={formData.item_name}
          onChange={handleInputChange}
          placeholder="مثال: بطارية سيارة"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="quantity">الكمية المطلوبة</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="1"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">ملاحظات (اختيارية)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="أي ملاحظات إضافية..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? 'جارٍ الحفظ...' : (editingOrder ? 'تحديث العنصر' : 'إضافة للقائمة')}
      </Button>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* عنوان الصفحة */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              قائمة التسوق
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              استخدم هذه الصفحة لتدوين الأصناف التي تحتاج لشرائها من السوق
            </p>
          </CardHeader>
          <CardContent>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  onClick={() => {
                    setEditingOrder(null);
                    setFormData({ item_name: '', quantity: '', notes: '' });
                  }}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة صنف للقائمة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingOrder ? 'تعديل العنصر' : 'إضافة صنف جديد'}
                  </DialogTitle>
                </DialogHeader>
                <OrderForm />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* قائمة الأصناف */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{order.item_name}</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {order.quantity}
                  </span>
                </div>
                
                {order.notes && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {order.notes}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar-SA')}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(order)}
                      className="text-blue-600 hover:text-blue-800 p-2 h-8 w-8"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-800 p-2 h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">قائمة التسوق فارغة</p>
            <p className="text-gray-500 text-sm">ابدأ بإضافة الأصناف التي تحتاج لشرائها</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PurchaseOrders;
