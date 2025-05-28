
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    unit: 'قطعة'
  });

  // محاكاة البيانات - في التطبيق الحقيقي ستجلب من Supabase
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'فلتر هواء',
        category: 'فلاتر',
        purchase_price: 25,
        selling_price: 35,
        stock_quantity: 50,
        unit: 'قطعة',
        created_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'بطارية سيارة 70 أمبير',
        category: 'بطاريات',
        purchase_price: 200,
        selling_price: 280,
        stock_quantity: 15,
        unit: 'قطعة',
        created_at: '2024-01-10'
      },
      {
        id: '3',
        name: 'زيت محرك 5W30',
        category: 'زيوت',
        purchase_price: 45,
        selling_price: 65,
        stock_quantity: 30,
        unit: 'علبة',
        created_at: '2024-01-12'
      }
    ];
    setProducts(mockProducts);
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      // تحديث المنتج
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              purchase_price: parseFloat(formData.purchase_price),
              selling_price: parseFloat(formData.selling_price),
              stock_quantity: parseInt(formData.stock_quantity),
              unit: formData.unit
            }
          : p
      ));
      setEditingProduct(null);
    } else {
      // إضافة منتج جديد
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        purchase_price: parseFloat(formData.purchase_price),
        selling_price: parseFloat(formData.selling_price),
        stock_quantity: parseInt(formData.stock_quantity),
        unit: formData.unit,
        created_at: new Date().toISOString()
      };
      setProducts([...products, newProduct]);
    }

    // إعادة تعيين النموذج
    setFormData({
      name: '',
      category: '',
      purchase_price: '',
      selling_price: '',
      stock_quantity: '',
      unit: 'قطعة'
    });
    setIsAddModalOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      purchase_price: product.purchase_price.toString(),
      selling_price: product.selling_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      unit: product.unit
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      setProducts(products.filter(p => p.id !== id));
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchase_price">سعر الشراء</Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            step="0.01"
            value={formData.purchase_price}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="selling_price">سعر البيع</Label>
          <Input
            id="selling_price"
            name="selling_price"
            type="number"
            step="0.01"
            value={formData.selling_price}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock_quantity">الكمية</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
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
        {editingProduct ? 'تحديث الصنف' : 'إضافة الصنف'}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50" dir="rtl">
      {/* شريط التنقل */}
      <nav className="bg-white shadow-lg border-b-2 border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-800 hover:text-purple-600 transition-colors">
              ← العودة للرئيسية
            </Link>
            <h1 className="text-xl font-bold text-purple-800">إدارة المخزون</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* أدوات البحث والتصفية */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-purple-600" />
              إدارة الأصناف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              
              <div className="sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setEditingProduct(null);
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
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                    </DialogTitle>
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
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">اسم الصنف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">الفئة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">سعر الشراء</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">سعر البيع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">الكمية المتوفرة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">الوحدة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-purple-800">العمليات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.purchase_price.toFixed(2)} ر.س</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.selling_price.toFixed(2)} ر.س</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
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
                      <td className="px-6 py-4 text-sm text-gray-700">{product.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
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
