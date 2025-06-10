
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';

interface Sale {
  id: string;
  sale_date: string;
  total_amount: number;
  created_at: string;
  sale_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      name: string;
    };
  }[];
}

interface SalesReport {
  totalSales: number;
  totalProducts: number;
  totalQuantity: number;
  productsWithIssues: string[];
  salesWithMultipleProducts: number;
}

const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date('2025-06-05')); // Set to June 5th for investigation
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const generateSalesReport = (salesData: Sale[]): SalesReport => {
    console.log('Generating sales report for data:', salesData);
    
    let totalProducts = 0;
    let totalQuantity = 0;
    let productsWithIssues: string[] = [];
    let salesWithMultipleProducts = 0;

    salesData.forEach(sale => {
      console.log(`Sale ${sale.id}:`, {
        date: sale.sale_date,
        itemsCount: sale.sale_items.length,
        items: sale.sale_items
      });

      if (sale.sale_items.length > 1) {
        salesWithMultipleProducts++;
      }

      sale.sale_items.forEach(item => {
        totalProducts++;
        totalQuantity += item.quantity;
        
        // Check for potential issues
        if (!item.product?.name || item.product.name === 'منتج غير معروف') {
          productsWithIssues.push(`Sale ${sale.id}: منتج مفقود أو غير معروف`);
        }
        
        console.log(`Product: ${item.product?.name}, Quantity: ${item.quantity}, Price: ${item.unit_price}`);
      });
    });

    const report = {
      totalSales: salesData.length,
      totalProducts,
      totalQuantity,
      productsWithIssues,
      salesWithMultipleProducts
    };

    console.log('Sales Report:', report);
    return report;
  };

  const fetchSales = async (period: 'daily' | 'weekly' | 'yearly', date: Date) => {
    try {
      setLoading(true);
      console.log('Fetching sales for:', { period, date: date.toISOString() });
      
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'daily':
          startDate = startOfDay(date);
          endDate = endOfDay(date);
          break;
        case 'weekly':
          startDate = startOfWeek(date, { weekStartsOn: 1 });
          endDate = endOfWeek(date, { weekStartsOn: 1 });
          break;
        case 'yearly':
          startDate = startOfYear(date);
          endDate = endOfYear(date);
          break;
        default:
          startDate = startOfDay(date);
          endDate = endOfDay(date);
      }

      console.log('Date range:', { 
        start: startDate.toISOString().split('T')[0], 
        end: endDate.toISOString().split('T')[0] 
      });

      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          sale_date,
          total_amount,
          created_at,
          sale_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name
            )
          )
        `)
        .gte('sale_date', startDate.toISOString().split('T')[0])
        .lte('sale_date', endDate.toISOString().split('T')[0])
        .order('sale_date', { ascending: false });

      console.log('Raw data from Supabase:', data);
      console.log('Supabase error:', error);

      if (error) throw error;

      const formattedSales: Sale[] = (data || []).map(sale => ({
        ...sale,
        sale_items: sale.sale_items.map(item => ({
          ...item,
          product: {
            name: item.products?.name || 'منتج غير معروف'
          }
        }))
      }));

      console.log('Formatted sales:', formattedSales);
      setSales(formattedSales);
      
      // Generate detailed report
      const report = generateSalesReport(formattedSales);
      setSalesReport(report);

      // Show detailed analysis in toast
      if (formattedSales.length > 0) {
        toast({
          title: "تحليل البيانات مكتمل",
          description: `تم العثور على ${report.totalSales} عملية بيع، ${report.totalProducts} منتج، ${report.salesWithMultipleProducts} عملية بمنتجات متعددة`,
        });
      }

    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب سجل المبيعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(selectedPeriod, selectedDate);
  }, [selectedPeriod, selectedDate]);

  const getTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'daily':
        return `مبيعات ${formatDate(selectedDate.toISOString())}`;
      case 'weekly':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `مبيعات الأسبوع من ${formatDate(weekStart.toISOString())} إلى ${formatDate(weekEnd.toISOString())}`;
      case 'yearly':
        return `مبيعات عام ${selectedDate.getFullYear()}`;
      default:
        return 'سجل المبيعات';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">سجل المبيعات - تحليل مفصل</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">مراجعة وتحليل سجل المبيعات مع فحص المنتجات المتعددة</p>
        </div>
      </div>

      {/* Sales Report Summary */}
      {salesReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">إجمالي المبيعات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {salesReport.totalSales}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">عملية بيع</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {salesReport.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">منتج مختلف</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">مبيعات متعددة المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {salesReport.salesWithMultipleProducts}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">عملية بمنتجات متعددة</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">المشاكل المكتشفة</CardTitle>
              {salesReport.productsWithIssues.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${salesReport.productsWithIssues.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {salesReport.productsWithIssues.length}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                {salesReport.productsWithIssues.length > 0 ? 'مشكلة مكتشفة' : 'لا توجد مشاكل'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issues Report */}
      {salesReport && salesReport.productsWithIssues.length > 0 && (
        <Card className="mb-6 border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              المشاكل المكتشفة في البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {salesReport.productsWithIssues.map((issue, index) => (
                <li key={index} className="text-red-700 dark:text-red-300 text-sm">
                  • {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">الفترة الزمنية</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={(value: 'daily' | 'weekly' | 'yearly') => setSelectedPeriod(value)}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="yearly">سنوي</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">التاريخ</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getTotalSales().toLocaleString()} دينار
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {sales.length} عملية بيع
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800/50 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{getPeriodTitle()}</CardTitle>
          <CardDescription className="dark:text-gray-400">
            تفاصيل المبيعات مع عرض مفصل للمنتجات المتعددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">لا توجد مبيعات في هذه الفترة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="text-right dark:text-gray-300">رقم البيع</TableHead>
                    <TableHead className="text-right dark:text-gray-300">تاريخ البيع</TableHead>
                    <TableHead className="text-right dark:text-gray-300">عدد المنتجات</TableHead>
                    <TableHead className="text-right dark:text-gray-300">تفاصيل المنتجات</TableHead>
                    <TableHead className="text-right dark:text-gray-300">إجمالي المبلغ</TableHead>
                    <TableHead className="text-right dark:text-gray-300">وقت الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">
                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {sale.id.substring(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell className="font-medium dark:text-white">
                        {formatDate(sale.sale_date)}
                      </TableCell>
                      <TableCell className="text-center dark:text-gray-300">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          sale.sale_items.length > 1 
                            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' 
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                        }`}>
                          {sale.sale_items.length}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        <div className="space-y-2">
                          {sale.sale_items.map((item, index) => (
                            <div key={item.id} className="text-sm border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                              <div className="font-medium">{index + 1}. {item.product.name}</div>
                              <div className="text-gray-600 dark:text-gray-400">
                                الكمية: {item.quantity} | سعر الوحدة: {item.unit_price} دينار | المجموع: {item.total_price} دينار
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-green-600 dark:text-green-400">
                        {sale.total_amount.toLocaleString()} دينار
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(sale.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistory;
