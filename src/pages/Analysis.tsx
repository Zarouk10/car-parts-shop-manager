
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalesAnalytics {
  totalSales: number;
  totalProfit: number;
  totalLoss: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  bestSellingProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailySalesData: Array<{
    date: string;
    sales: number;
    profit: number;
  }>;
  categorySales: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

const Analysis = () => {
  const [analytics, setAnalytics] = useState<SalesAnalytics>({
    totalSales: 0,
    totalProfit: 0,
    totalLoss: 0,
    dailyAverage: 0,
    weeklyAverage: 0,
    monthlyAverage: 0,
    bestSellingProducts: [],
    dailySalesData: [],
    categorySales: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      // جلب بيانات المبيعات
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (name, category, purchase_price, selling_price)
          )
        `)
        .gte('sale_date', dateRange.from)
        .lte('sale_date', dateRange.to)
        .eq('user_id', user.id);

      if (salesError) throw salesError;

      // حساب الإحصائيات
      const totalSales = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      let totalProfit = 0;
      let totalLoss = 0;
      const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {};
      const categorySales: Record<string, number> = {};
      const dailySales: Record<string, { sales: number; profit: number }> = {};

      sales?.forEach(sale => {
        const saleDate = sale.sale_date;
        if (!dailySales[saleDate]) {
          dailySales[saleDate] = { sales: 0, profit: 0 };
        }
        dailySales[saleDate].sales += Number(sale.total_amount);

        sale.sale_items?.forEach((item: any) => {
          const product = item.products;
          if (product) {
            const itemProfit = (Number(item.unit_price) - Number(product.purchase_price)) * Number(item.quantity);
            
            if (itemProfit > 0) {
              totalProfit += itemProfit;
            } else {
              totalLoss += Math.abs(itemProfit);
            }
            
            dailySales[saleDate].profit += itemProfit;

            // أفضل المنتجات مبيعاً
            if (!productSales[product.name]) {
              productSales[product.name] = { quantity: 0, revenue: 0, name: product.name };
            }
            productSales[product.name].quantity += Number(item.quantity);
            productSales[product.name].revenue += Number(item.total_price);

            // مبيعات الفئات
            if (!categorySales[product.category]) {
              categorySales[product.category] = 0;
            }
            categorySales[product.category] += Number(item.total_price);
          }
        });
      });

      // حساب المتوسطات
      const daysCount = Math.max(1, Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)));
      const dailyAverage = totalSales / daysCount;
      const weeklyAverage = (totalSales / daysCount) * 7;
      const monthlyAverage = (totalSales / daysCount) * 30;

      // تحويل البيانات للرسوم البيانية
      const bestSellingProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const dailySalesData = Object.entries(dailySales)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('ar-SA'),
          sales: data.sales,
          profit: data.profit
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const totalCategorySales = Object.values(categorySales).reduce((sum, value) => sum + value, 0);
      const categoryData = Object.entries(categorySales)
        .map(([category, value]) => ({
          category,
          value,
          percentage: totalCategorySales > 0 ? (value / totalCategorySales) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);

      setAnalytics({
        totalSales,
        totalProfit,
        totalLoss,
        dailyAverage,
        weeklyAverage,
        monthlyAverage,
        bestSellingProducts,
        dailySalesData,
        categorySales: categoryData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات التحليلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    sales: {
      label: "المبيعات",
      color: "#10b981",
    },
    profit: {
      label: "الربح",
      color: "#3b82f6",
    }
  };

  const pieColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* فلاتر التاريخ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              فترة التحليل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">من تاريخ</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ملخص الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.totalSales.toFixed(2)} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الربح</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalProfit.toFixed(2)} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل البيع اليومي</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.dailyAverage.toFixed(2)} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل البيع الأسبوعي</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.weeklyAverage.toFixed(2)} ر.س
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم المبيعات اليومية */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات والأرباح اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* مبيعات الفئات */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المبيعات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categorySales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أفضل المنتجات مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              أفضل المنتجات مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-50">
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">المنتج</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">الكمية المباعة</th>
                    <th className="p-3 border border-gray-300 text-right font-semibold text-green-800">إجمالي الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.bestSellingProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300 font-medium">{product.name}</td>
                      <td className="p-3 border border-gray-300 text-center">{product.quantity}</td>
                      <td className="p-3 border border-gray-300 text-center font-medium text-green-600">
                        {product.revenue.toFixed(2)} ر.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.bestSellingProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد بيانات مبيعات في الفترة المحددة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analysis;
