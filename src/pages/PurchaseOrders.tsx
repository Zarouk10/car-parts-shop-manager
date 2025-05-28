
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save, ShoppingCart, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  purchase_price: number;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const PurchaseOrders = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { product_id: '', quantity: 0, unit_price: 0, total_price: 0 }
  ]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // محاكاة البيانات
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      { id: '1', name: 'شركة الخليج للإكسسوارات', phone: '0501234567', address: 'الرياض' },
      { id: '2', name: 'مؤسسة النجوم التجارية', phone: '0507654321', address: 'جدة' },
      { id: '3', name: 'شركة الأندلس للسيارات', phone: '0509876543', address: 'الدمام' }
    ];

    const mockProducts: Product[] = [
      { id: '1', name: 'فلتر هواء', purchase_price: 25 },
      { id: '2', name: 'بطارية سيارة 70 أمبير', purchase_price: 200 },
      { id: '3', name: 'زيت محرك 5W30', purchase_price: 45 },
      { id: '4', name: 'فلتر زيت', purchase_price: 15 },
      { id: '5', name: 'بطارية 90 أمبير', purchase_price: 250 },
      { id: '6', name: 'مصباح LED', purchase_price: 30 }
    ];

    setSuppliers(mockSuppliers);
    setProducts(mockProducts);
  }, []);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...items];
    const numValue = parseFloat(value) || 0;
    
    if (field === 'product_id') {
      newItems[index][field] = value;
      // تعبئة سعر الشراء تلقائياً
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price = product.purchase_price;
      }
    } else {
      newItems[index][field] = numValue;
    }

    // حساب السعر الكلي للصف
    if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
      const qty = newItems[index].quantity || 0;
      const price = newItems[index].unit_price || 0;
      newItems[index].total_price = qty * price;
    }

    setItems(newItems);
    calculateGrandTotal(newItems);
  };

  const calculateGrandTotal = (itemsList: OrderItem[]) => {
    const total = itemsList.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setGrandTotal(total);
  };

  const addNewRow = () => {
    setItems([...items, { product_id: '', quantity: 0, unit_price: 0, total_price: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      calculateGrandTotal(newItems);
    }
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: supplierForm.name,
      phone: supplierForm.phone,
      address: supplierForm.address
    };
    setSuppliers([...suppliers, newSupplier]);
    setSupplierForm({ name: '', phone: '', address: '' });
    setIsSupplierModalOpen(false);
    setSelectedSupplier(newSupplier.id);
  };

  const handleOrderSubmit = () => {
    if (!selectedSupplier) {
      alert('يرجى اختيار مورد');
      return;
    }

    const validItems = items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      alert('يرجى إضافة صنف واحد على الأقل');
      return;
    }

    // هنا ستتم عملية الحفظ في قاعدة البيانات
    console.log('حفظ طلب الشراء:', {
      supplier_id: selectedSupplier,
      total_amount: grandTotal,
      items: validItems
    });

    alert('تم حفظ وصل الطلبات بنجاح');
    
    // إعادة تعيين النموذج
    setSelectedSupplier('');
    setItems([{ product_id: '', quantity: 0, unit_price: 0, total_price: 0 }]);
    setGrandTotal(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      {/* شريط التنقل */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              ← العودة للرئيسية
            </Link>
            <h1 className="text-xl font-bold text-blue-800">وصل الطلبات</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* بيانات المورد */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              بيانات المورد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="supplier">اختر المورد</Label>
                <select
                  id="supplier"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- اختر المورد --</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.phone}
                    </option>
                  ))}
                </select>
              </div>

              <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-blue-600 border-blue-300">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مورد جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مورد جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSupplierSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="supplierName">اسم المورد</Label>
                      <Input
                        id="supplierName"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                        placeholder="اسم المورد"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierPhone">رقم الهاتف</Label>
                      <Input
                        id="supplierPhone"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierAddress">العنوان</Label>
                      <Input
                        id="supplierAddress"
                        value={supplierForm.address}
                        onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                        placeholder="المدينة"
                      />
                    </div>
                    <Button type="submit" className="w-full">إضافة المورد</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* جدول الأصناف */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-3 border border-gray-300 text-right font-semibold text-blue-800">الصنف</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-blue-800">الكمية</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-blue-800">سعر الوحدة</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-blue-800">السعر الكلي</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-blue-800">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- اختر صنف --</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border border-gray-300">
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="text-center"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3 border border-gray-300">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price || ''}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          className="text-center"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-3 border border-gray-300 text-center font-medium">
                        {item.total_price.toFixed(2)} ر.س
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRow(index)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Button onClick={addNewRow} variant="outline" className="text-green-600 border-green-300">
                <Plus className="h-4 w-4 ml-2" />
                إضافة صنف
              </Button>

              <div className="text-right">
                <div className="text-lg font-bold text-blue-800">
                  الإجمالي الكلي: {grandTotal.toFixed(2)} ر.س
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أزرار الحفظ */}
        <div className="flex justify-center">
          <Button 
            onClick={handleOrderSubmit}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <Save className="h-5 w-5 ml-2" />
            حفظ وصل الطلبات
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PurchaseOrders;
