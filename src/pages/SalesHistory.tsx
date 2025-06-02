import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';
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

const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const fetchSales = async (period: 'daily' | 'weekly' | 'yearly', date: Date) => {
    try {
      setLoading(true);
      
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

      setSales(formattedSales);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">سجل المبيعات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">عرض وإدارة سجل المبيعات حسب الفترة المحددة</p>
        </div>
      </div>

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
            تفاصيل المبيعات للفترة المحددة
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
                    <TableHead className="text-right dark:text-gray-300">تاريخ البيع</TableHead>
                    <TableHead className="text-right dark:text-gray-300">المنتجات</TableHead>
                    <TableHead className="text-right dark:text-gray-300">إجمالي المبلغ</TableHead>
                    <TableHead className="text-right dark:text-gray-300">وقت الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">
                        {formatDate(sale.sale_date)}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        <div className="space-y-1">
                          {sale.sale_items.map((item) => (
                            <div key={item.id} className="text-sm">
                              {item.product.name} - الكمية: {item.quantity} - السعر: {item.unit_price} دينار
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
