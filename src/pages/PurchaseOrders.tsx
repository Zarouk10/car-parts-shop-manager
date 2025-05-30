import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Edit2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PurchaseOrder {
  id: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  purchase_price: number;
  selling_price: number;
  is_purchased: boolean;
  purchase_date: string | null;
  created_at: string;
  user_id: string;
}

interface DatabasePurchaseOrder {
  id: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  purchase_price?: number;
  selling_price?: number;
  is_purchased?: boolean;
  purchase_date?: string;
  created_at: string;
  user_id: string;
}

const PurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: '1',
    notes: '',
    purchase_price: '',
    selling_price: ''
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
      
      // تحويل البيانات من قاعدة البيانات إلى النوع المطلوب مع القيم الافتراضية
      const ordersWithDefaults: PurchaseOrder[] = (data as DatabasePurchaseOrder[] || []).map(order => ({
        id: order.id,
        item_name: order.item_name,
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
            notes: formData.notes || null,
            purchase_price: parseFloat(formData.purchase_price) || 0,
            selling_price: parseFloat(formData.selling_price) || 0
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
            purchase_price: parseFloat(formData.purchase_price) || 0,
            selling_price: parseFloat(formData.selling_price) || 0,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة العنصر لقائمة التسوق",
        });
      }

      // إعادة تعيين النموذج
      setFormData({ item_name: '', quantity: '1', notes: '', purchase_price: '', selling_price: '' });
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
      notes: order.notes || '',
      purchase_price: order.purchase_price?.toString() || '',
      selling_price: order.selling_price?.toString() || ''
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

  const resetForm = () => {
    setFormData({ item_name: '', quantity: '1', notes: '', purchase_price: '', selling_price: '' });
    setEditingOrder(null);
    setIsModalOpen(false);
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

      // إضافة العنصر إلى المخزون
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: order.item_name,
          category: 'عام', // فئة افتراضية
          purchase_price: order.purchase_price || 0,
          selling_price: order.selling_price || 0,
          stock_quantity: order.quantity,
          unit: 'قطعة',
          user_id: user.id
        });

      if (insertError) throw insertError;

      // تحديث العنصر في قائمة التسوق لتسجيل تاريخ الشراء
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* عنوان الصفحة */}
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
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-3"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة صنف للقائمة
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-right text-lg sm:text-xl">
                    {editingOrder ? 'تعديل العنصر' : 'إضافة صنف جديد'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="item_name" className="text-sm sm:text-base font-medium">اسم الصنف *</Label>
                    <Input
                      id="item_name"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleInputChange}
                      placeholder="مثال: بطارية سيارة"
                      required
                      className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm sm:text-base font-medium">الكمية المطلوبة *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="1"
                      required
                      className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase_price" className="text-sm sm:text-base font-medium">سعر الشراء</Label>
                      <Input
                        id="purchase_price"
                        name="purchase_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.purchase_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selling_price" className="text-sm sm:text-base font-medium">سعر البيع</Label>
                      <Input
                        id="selling_price"
                        name="selling_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.selling_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm sm:text-base font-medium">ملاحظات (اختيارية)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات إضافية..."
                      rows={3}
                      className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={saving} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm sm:text-base font-medium"
                    >
                      {saving ? 'جارٍ الحفظ...' : (editingOrder ? 'تحديث العنصر' : 'حفظ في القائمة')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-sm sm:text-base"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* قائمة الأصناف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {orders.map((order) => (
            <Card key={order.id} className={`hover:shadow-lg transition-all duration-200 border ${order.is_purchased ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
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

                {(order.purchase_price || order.selling_price) && (
                  <div className="mb-3 text-xs sm:text-sm text-gray-600">
                    {order.purchase_price && (
                      <div>سعر الشراء: {order.purchase_price} ر.س</div>
                    )}
                    {order.selling_price && (
                      <div>سعر البيع: {order.selling_price} ر.س</div>
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
                        onClick={() => handleMarkAsPurchased(order)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 h-8 w-8"
                        title="تم الشراء - نقل إلى المخزون"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(order)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 h-8 w-8 border-blue-200"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-8 w-8 border-red-200"
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
          <div className="text-center py-12 sm:py-16">
            <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-base sm:text-lg mb-2 font-medium">قائمة التسوق فارغة</p>
            <p className="text-gray-500 text-sm sm:text-base">ابدأ بإضافة الأصناف التي تحتاج لشرائها</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;
