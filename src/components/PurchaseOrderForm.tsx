import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface PurchaseOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingOrder: PurchaseOrder | null;
  onSuccess: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  isOpen,
  onClose,
  editingOrder,
  onSuccess
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '1',
    notes: '',
    purchase_price: '',
    selling_price: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        item_name: editingOrder.item_name,
        category: editingOrder.category,
        quantity: editingOrder.quantity.toString(),
        notes: editingOrder.notes || '',
        purchase_price: editingOrder.purchase_price?.toString() || '',
        selling_price: editingOrder.selling_price?.toString() || ''
      });
    } else {
      setFormData({
        item_name: '',
        category: '',
        quantity: '1',
        notes: '',
        purchase_price: '',
        selling_price: ''
      });
    }
  }, [editingOrder, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_name.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم الصنف",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال الفئة",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      if (editingOrder) {
        const { error } = await supabase
          .from('purchase_orders')
          .update({
            item_name: formData.item_name,
            category: formData.category,
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
        const { error } = await supabase
          .from('purchase_orders')
          .insert({
            item_name: formData.item_name,
            category: formData.category,
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

      onSuccess();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-right text-lg sm:text-xl dark:text-white">
            {editingOrder ? 'تعديل العنصر' : 'إضافة صنف جديد'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item_name" className="text-sm sm:text-base font-medium dark:text-gray-300">اسم الصنف *</Label>
            <Input
              id="item_name"
              name="item_name"
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="مثال: بطارية سيارة"
              required
              className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm sm:text-base font-medium dark:text-gray-300">الفئة *</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="مثال: إلكترونيات، أجهزة، قطع غيار..."
              required
              className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm sm:text-base font-medium dark:text-gray-300">الكمية المطلوبة *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="1"
              required
              className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-sm sm:text-base font-medium dark:text-gray-300">سعر الشراء (د.ع)</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price" className="text-sm sm:text-base font-medium dark:text-gray-300">سعر البيع (د.ع)</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm sm:text-base font-medium dark:text-gray-300">ملاحظات (اختيارية)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
              className="w-full text-sm sm:text-base p-3 border-2 rounded-lg focus:border-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              dir="rtl"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={saving} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 text-sm sm:text-base font-medium"
            >
              {saving ? 'جارٍ الحفظ...' : (editingOrder ? 'تحديث العنصر' : 'حفظ في القائمة')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 text-sm sm:text-base"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderForm;
