
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencySimple } from '@/lib/currency';
import ExportData from '@/components/ExportData';

interface AnalyticsData {
  dailySales: Array<{
    date: string;
    sales: number;
    profit: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    sales: number;
    profit: number;
  }>;
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
}

const Analysis = () => {
  const [data, setData] = useState<AnalyticsData>({
    dailySales: [],
    topProducts: [],
    categoryPerformance: [],
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      // جلب بيانات المبيعات مع تفاصيل المنتجات
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          id,
          sale_date,
          total_amount,
          sale_items (
            quantity,
            unit_price,
            total_price,
            products (name, category, purchase_price)
          )
        `)
        .eq('user_id', user.id)
        .gte('sale_date', startDate)
        .order('sale_date');

      if (salesData) {
        // تحليل المبيعات اليومية
        const dailySalesMap = new Map();
        let totalRevenue = 0;
        let totalProfit = 0;
        const productSales = new Map();
        const categorySales = new Map();

        salesData.forEach(sale => {
          const date = sale.sale_date;
          totalRevenue += Number(sale.total_amount);

          if (!dailySalesMap.has(date)) {
            dailySalesMap.set(date, { sales: 0, profit: 0 });
          }

          let dayProfit = 0;
          sale.sale_items?.forEach((item: any) => {
            const product = item.products;
            if (product) {
              const profit = (Number(item.unit_price) - Number(product.purchase_price)) * Number(item.quantity);
              dayProfit += profit;
              totalProfit += profit;

              // إحصائيات المنتجات
              const productKey = product.name;
              if (!productSales.has(productKey)) {
                productSales.set(productKey, { quantity: 0, revenue: 0 });
              }
              const productData = productSales.get(productKey);
              productData.quantity += Number(item.quantity);
              productData.revenue += Number(item.total_price);

              // إحصائيات الفئات
              const categoryKey = product.category;
              if (!categorySales.has(categoryKey)) {
                categorySales.set(categoryKey, { sales: 0, profit: 0 });
              }
              const categoryData = categorySales.get(categoryKey);
              categoryData.sales += Number(item.total_price);
              categoryData.profit += profit;
            }
          });

          const dayData = dailySalesMap.get(date);
          dayData.sales += Number(sale.total_amount);
          dayData.profit += dayProfit;
        });

        // تحويل البيانات إلى مصفوفات
        const dailySales = Array.from(dailySalesMap.entries())
          .map(([date, data]: [string, any]) => ({
            date: new Date(date).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' }),
            sales: data.sales,
            profit: data.profit
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const topProducts = Array.from(productSales.entries())
          .map(([name, data]: [string, any]) => ({
            name,
            quantity: data.quantity,
            revenue: data.revenue
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        const categoryPerformance = Array.from(categorySales.entries())
          .map(([category, data]: [string, any]) => ({
            category,
            sales: data.sales,
            profit: data.profit
          }))
          .sort((a, b) => b.sales - a.sales);

        setData({
          dailySales,
          topProducts,
          categoryPerformance,
          totalRevenue,
          totalProfit,
          totalOrders: salesData.length,
          averageOrderValue: salesData.length > 0 ? totalRevenue / salesData.length : 0
        });
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات التحليل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جارٍ تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 pb-safe transition-colors duration-300" dir="rtl">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">تحليل المبيعات والأرباح</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">تحليل شامل لأداء المبيعات والأرباح</p>
          </div>
          
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="اختر الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectItem value="7d" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">آخر 7 أيام</SelectItem>
              <SelectItem value="30d" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">آخر 30 يوم</SelectItem>
              <SelectItem value="90d" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrencySimple(data.totalRevenue)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                للفترة المحددة
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">إجمالي الأرباح</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrencySimple(data.totalProfit)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                هامش ربح {data.totalRevenue > 0 ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">عدد الطلبات</CardTitle>
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.totalOrders}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                إجمالي عمليات البيع
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">متوسط قيمة الطلب</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrencySimple(data.averageOrderValue)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                متوسط قيمة البيع الواحد
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* رسم المبيعات والأرباح اليومية */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">المبيعات والأرباح اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fontSize: 10, fill: 'currentColor' }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fontSize: 10, fill: 'currentColor' }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrencySimple(Number(value)), 
                        name === 'sales' ? 'المبيعات' : 'الأرباح'
                      ]}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar dataKey="sales" fill="#10b981" name="المبيعات" />
                    <Bar dataKey="profit" fill="#3b82f6" name="الأرباح" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* أداء الفئات */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">أداء الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                {data.categoryPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="sales"
                        fontSize={10}
                      >
                        {data.categoryPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrencySimple(Number(value)), 'المبيعات']}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">لا توجد بيانات متاحة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أفضل المنتجات مبيعاً */}
        <Card className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/10">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">أفضل المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50 dark:bg-gray-700">
                      <th className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 text-right font-semibold text-blue-800 dark:text-blue-300 text-sm">المنتج</th>
                      <th className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 text-right font-semibold text-blue-800 dark:text-blue-300 text-sm">الكمية</th>
                      <th className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 text-right font-semibold text-blue-800 dark:text-blue-300 text-sm">الإيرادات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 font-medium text-sm text-gray-900 dark:text-white">{product.name}</td>
                        <td className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 text-center text-sm text-gray-700 dark:text-gray-300">{product.quantity}</td>
                        <td className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 text-center font-semibold text-green-600 dark:text-green-400 text-sm">
                          {formatCurrencySimple(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.topProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد بيانات مبيعات متاحة</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* مكون تصدير البيانات */}
        <ExportData />
      </main>
    </div>
  );
};

export default Analysis;
