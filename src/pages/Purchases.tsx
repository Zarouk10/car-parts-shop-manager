
import React, { useState, useEffect } from 'react';
import { Package, Calendar, ShoppingBag, Filter, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  purchase_date: string;
  notes: string | null;
}

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [dateFilter, setDateFilter] = useState('الكل');
  const { toast } = useToast();

  const categories = ['الكل', 'عام', 'إلكترونيات', 'أجهزة', 'قطع غيار', 'مواد غذائية', 'أخرى'];

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, searchTerm, categoryFilter, dateFilter]);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('is_purchased', true)
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      const purchaseData: Purchase[] = (data || []).map(item => ({
        id: item.id,
        item_name: item.item_name,
        category: item.category || 'عام',
        quantity: item.quantity,
        purchase_price: item.purchase_price || 0,
        selling_price: item.selling_price || 0,
        purchase_date: item.purchase_date || '',
        notes: item.notes
      }));

      setPurchases(purchaseData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المشتريات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPurchases = () => {
    let filtered = purchases;

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الفئة
    if (categoryFilter !== 'الكل') {
      filtered = filtered.filter(purchase => purchase.category === categoryFilter);
    }

    // تصفية حسب التاريخ
    if (dateFilter !== 'الكل') {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'اليوم':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(purchase => 
            new Date(purchase.purchase_date) >= filterDate
          );
          break;
        case 'هذا الأسبوع':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(purchase => 
            new Date(purchase.purchase_date) >= filterDate
          );
          break;
        case 'هذا الشهر':
          filterDate.setMonth(today.getMonth());
          filterDate.setDate(1);
          filtered = filtered.filter(purchase => 
            new Date(purchase.purchase_date) >= filterDate
          );
          break;
      }
    }

    setFilteredPurchases(filtered);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} د.ع`;
  };

  const getTotalValue = () => {
    return filteredPurchases.reduce((total, purchase) => 
      total + (purchase.purchase_price * purchase.quantity), 0
    );
  };

  const getTotalProfit = () => {
    return filteredPurchases.reduce((total, purchase) => 
      total + ((purchase.selling_price - purchase.purchase_price) * purchase.quantity), 0
    );
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
        {/* عنوان الصفحة */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              سجل المشتريات
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              عرض وإدارة جميع المشتريات المكتملة مع إمكانية البحث والتصفية
            </p>
          </CardHeader>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(getTotalValue())}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الأرباح المتوقعة</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(getTotalProfit())}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">عدد الأصناف</p>
                  <p className="text-lg font-bold text-purple-600">
                    {filteredPurchases.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أدوات البحث والتصفية */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في المشتريات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">كل الفترات</SelectItem>
                  <SelectItem value="اليوم">اليوم</SelectItem>
                  <SelectItem value="هذا الأسبوع">هذا الأسبوع</SelectItem>
                  <SelectItem value="هذا الشهر">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('الكل');
                  setDateFilter('الكل');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* جدول المشتريات */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">قائمة المشتريات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الصنف</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">سعر الشراء</TableHead>
                    <TableHead className="text-right">سعر البيع</TableHead>
                    <TableHead className="text-right">الربح المتوقع</TableHead>
                    <TableHead className="text-right">تاريخ الشراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">
                          {purchase.item_name}
                          {purchase.notes && (
                            <p className="text-xs text-gray-500 mt-1">{purchase.notes}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {purchase.category}
                          </span>
                        </TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell>{formatCurrency(purchase.purchase_price)}</TableCell>
                        <TableCell>{formatCurrency(purchase.selling_price)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency((purchase.selling_price - purchase.purchase_price) * purchase.quantity)}
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.purchase_date).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-600">لا توجد مشتريات مطابقة للتصفية المحددة</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Purchases;
