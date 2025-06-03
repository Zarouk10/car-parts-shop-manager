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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* عنوان الصفحة */}
        <Card className="mb-6 shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800 dark:text-blue-300">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              سجل المشتريات
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              عرض وإدارة جميع المشتريات المكتملة مع إمكانية البحث والتصفية
            </p>
          </CardHeader>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 hover:shadow-lg dark:hover:shadow-gray-900/25">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشتريات</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(getTotalValue())}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 hover:shadow-lg dark:hover:shadow-gray-900/25">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الأرباح المتوقعة</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(getTotalProfit())}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 hover:shadow-lg dark:hover:shadow-gray-900/25">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عدد الأصناف</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {filteredPurchases.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أدوات البحث والتصفية */}
        <Card className="mb-6 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="البحث في المشتريات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="تصفية حسب الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="تصفية حسب التاريخ" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="الكل" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">كل الفترات</SelectItem>
                  <SelectItem value="اليوم" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">اليوم</SelectItem>
                  <SelectItem value="هذا الأسبوع" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">هذا الأسبوع</SelectItem>
                  <SelectItem value="هذا الشهر" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('الكل');
                  setDateFilter('الكل');
                }}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Filter className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* جدول المشتريات */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">قائمة المشتريات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">اسم الصنف</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">الفئة</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">الكمية</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">سعر الشراء</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">سعر البيع</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">الربح المتوقع</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">تاريخ الشراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {purchase.item_name}
                          {purchase.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{purchase.notes}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-700">
                            {purchase.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100 font-medium">{purchase.quantity}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{formatCurrency(purchase.purchase_price)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{formatCurrency(purchase.selling_price)}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency((purchase.selling_price - purchase.purchase_price) * purchase.quantity)}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {new Date(purchase.purchase_date).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                          <p className="text-gray-600 dark:text-gray-400">لا توجد مشتريات مطابقة للتصفية المحددة</p>
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
