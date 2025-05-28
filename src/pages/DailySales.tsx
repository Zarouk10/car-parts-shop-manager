
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save, TrendingUp, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
}

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  available_stock: number;
}

const DailySales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItem[]>([
    { product_id: '', quantity: 0, unit_price: 0, total_price: 0, available_stock: 0 }
  ]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // محاكاة البيانات
  useEffect(() => {
    const mockProducts: Product[] = [
      { id: '1', name: 'فلتر هواء', selling_price: 35, stock_quantity: 50 },
      { id: '2', name: 'بطارية سيارة 70 أمبير', selling_price: 280, stock_quantity: 15 },
      { id: '3', name: 'زيت محرك 5W30', selling_price: 65, stock_quantity: 30 },
      { id: '4', name: 'فلتر زيت', selling_price: 22, stock_quantity: 40 },
      { id: '5', name: 'بطارية 90 أمبير', selling_price: 350, stock_quantity: 8 },
      { id: '6', name: 'مصباح LED', selling_price: 45, stock_quantity: 25 }
    ];

    setProducts(mockProducts);
  }, []);

  const handleItemChange = (index: number, field: keyof SaleItem, value: string) => {
    const newItems = [...items];
    const numValue = parseFloat(value) || 0;
    
    if (field === 'product_id') {
      newItems[index][field] = value;
      // تعبئة سعر البيع والمخزون المتاح تلقائياً
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price = product.selling_price;
        newItems[index].available_stock = product.stock_quantity;
        // إعادة تعيين الكمية إذا كانت تتجاوز المتاح
        if (newItems[index].quantity > product.stock_quantity) {
          newItems[index].quantity = 0;
        }
      }
    } else if (field === 'quantity') {
      // التحقق من عدم تجاوز المخزون المتاح
      const maxQuantity = newItems[index].available_stock || 0;
      newItems[index][field] = Math.min(numValue, maxQuantity);
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

  const calculateGrandTotal = (itemsList: SaleItem[]) => {
    const total = itemsList.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setGrandTotal(total);
  };

  const addNewRow = () => {
    setItems([...items, { product_id: '', quantity: 0, unit_price: 0, total_price: 0, available_stock: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      calculateGrandTotal(newItems);
    }
  };

  const handleSaleSubmit = () => {
    const validItems = items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      alert('يرجى إضافة صنف واحد على الأقل');
      return;
    }

    // التحقق من توفر الكمية المطلوبة
    const insufficientStock = validItems.find(item => item.quantity > item.available_stock);
    if (insufficientStock) {
      alert('الكمية المطلوبة تتجاوز المخزون المتاح لأحد الأصناف');
      return;
    }

    // هنا ستتم عملية الحفظ في قاعدة البيانات
    console.log('حفظ عملية البيع:', {
      sale_date: saleDate,
      total_amount: grandTotal,
      items: validItems
    });

    alert('تم حفظ عملية البيع بنجاح');
    
    // إعادة تعيين النموذج
    setItems([{ product_id: '', quantity: 0, unit_price: 0, total_price: 0, available_stock: 0 }]);
    setGrandTotal(0);
  };

  const getStockStatus = (quantity: number, available: number) => {
    if (quantity > available) {
      return 'text-red-600 bg-red-50';
    } else if (available < 10) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50" dir="rtl">
      {/* شريط التنقل */}
      <nav className="bg-white shadow-lg border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-800 hover:text-green-600 transition-colors">
              ← العودة للرئيسية
            </Link>
            <h1 className="text-xl font-bold text-green-800">البيع اليومي</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* معلومات الفاتورة */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-green-600" />
              معلومات الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="saleDate">تاريخ البيع</Label>
                <Input
                  type="date"
                  id="saleDate"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>
              <div>
                <Label>رقم الفاتورة</Label>
                <Input value={`INV-${Date.now()}`} disabled className="bg-gray-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول الأصناف */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              أصناف البيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-50">
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">الصنف</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">المتوفر</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">الكمية</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">سعر الوحدة</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">السعر الكلي</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">-- اختر صنف --</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        {item.available_stock > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(item.quantity, item.available_stock)}`}>
                            {item.available_stock}
                          </span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-300">
                        <Input
                          type="number"
                          min="0"
                          max={item.available_stock}
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className={`text-center ${item.quantity > item.available_stock ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="0"
                        />
                        {item.quantity > item.available_stock && (
                          <p className="text-red-500 text-xs mt-1 text-center">
                            الحد الأقصى: {item.available_stock}
                          </p>
                        )}
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
                <div className="text-lg font-bold text-green-800">
                  الإجمالي الكلي: {grandTotal.toFixed(2)} ر.س
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ملاحظة تحذيرية */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm">
                <strong>تنبيه:</strong> تأكد من صحة الكميات المدخلة. سيتم خصم الكميات المباعة من المخزون تلقائياً بعد الحفظ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* أزرار الحفظ */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSaleSubmit}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            <Save className="h-5 w-5 ml-2" />
            حفظ عملية البيع
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DailySales;
