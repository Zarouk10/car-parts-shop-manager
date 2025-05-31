
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencySimple } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  category: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  created_at: string;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    unit: 'قطعة'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          category: formData.category,
          purchase_price: parseFloat(formData.purchase_price),
          selling_price: parseFloat(formData.selling_price),
          stock_quantity: parseInt(formData.stock_quantity),
          unit: formData.unit,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم إضافة الصنف بنجاح",
      });

      // إعادة تعيين النموذج وإغلاق النافذة
      setFormData({
        name: '',
        category: '',
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
        unit: 'قطعة'
      });
      setIsAddModalOpen(false);
      
      // إعادة جلب البيانات
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الصنف",
        variant: "destructive",
      });
    }
  };

  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم الصنف</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="مثال: فلتر هواء"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="category">الفئة</Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="مثال: فلاتر"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchase_price">سعر الشراء (دينار عراقي)</Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchase_price}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="selling_price">سعر البيع (دينار عراقي)</Label>
          <Input
            id="selling_price"
            name="selling_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.selling_price}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock_quantity">الكمية</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={handleInputChange}
            placeholder="0"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="unit">الوحدة</Label>
          <Input
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            placeholder="قطعة"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        إضافة الصنف
      </Button>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* أدوات البحث والتصفية */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              إدارة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الأصناف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">كل الفئات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                    onClick={() => {
                      setFormData({
                        name: '',
                        category: '',
                        purchase_price: '',
                        selling_price: '',
                        stock_quantity: '',
                        unit: 'قطعة'
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة صنف جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4 sm:mx-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة صنف جديد</DialogTitle>
                  </DialogHeader>
                  <ProductForm />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* جدول الأصناف */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-purple-800">اسم الصنف</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-purple-800">الفئة</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-purple-800">سعر الشراء</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-purple-800">سعر البيع</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-purple-800">الكمية</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-purple-800">الوحدة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">{formatCurrencySimple(product.purchase_price)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">{formatCurrencySimple(product.selling_price)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock_quantity < 10 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock_quantity < 30 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">{product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">لا توجد أصناف مطابقة للبحث</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
