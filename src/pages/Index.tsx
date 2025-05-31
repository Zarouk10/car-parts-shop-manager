
import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, AlertTriangle, ShoppingCart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencySimple } from '@/lib/currency';
import AlertBanner from '@/components/AlertBanner';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  totalSales: number;
  totalProfit: number;
  pendingOrders: number;
  recentSales: Array<{
    date: string;
    amount: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  lowStockItems: Array<{
    name: string;
    stock: number;
    category: string;
  }>;
}

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    todaySales: 0,
    totalSales: 0,
    totalProfit: 0,
    pendingOrders: 0,
    recentSales: [],
    categoryDistribution: [],
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // جلب بيانات المنتجات
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      // جلب بيانات المبيعات
      const { data: sales } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (name, purchase_price, selling_price)
          )
        `)
        .eq('user_id', user.id);

      // جلب أوامر الشراء المعلقة
      const { data: pendingOrders } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_purchased', false);

      if (products && sales) {
        // حساب الإحصائيات
        const totalProducts = products.length;
        const lowStockItems = products.filter(p => p.stock_quantity <= 5);
        const lowStockProducts = lowStockItems.length;

        const todaySales = sales
          .filter(sale => sale.sale_date === today)
          .reduce((sum, sale) => sum + Number(sale.total_amount), 0);

        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

        let totalProfit = 0;
        sales.forEach(sale => {
          sale.sale_items?.forEach((item: any) => {
            const product = item.products;
            if (product) {
              const profit = (Number(item.unit_price) - Number(product.purchase_price)) * Number(item.quantity);
              totalProfit += profit;
            }
          });
        });

        // بيانات المبيعات الأخيرة (آخر 7 أيام)
        const recentSales = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('ar-IQ', { weekday: 'short' });
          
          const daySales = sales
            .filter(sale => sale.sale_date === dateStr)
            .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
          
          recentSales.push({
            date: dayName,
            amount: daySales
          });
        }

        // توزيع الفئات
        const categoryCount: Record<string, number> = {};
        products.forEach(product => {
          categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });

        const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count
        }));

        setStats({
          totalProducts,
          lowStockProducts,
          todaySales,
          totalSales,
          totalProfit,
          pendingOrders: pendingOrders?.length || 0,
          recentSales,
          categoryDistribution,
          lowStockItems: lowStockItems.slice(0, 5).map(item => ({
            name: item.name,
            stock: item.stock_quantity,
            category: item.category
          }))
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات لوحة التحكم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    amount: {
      label: "المبيعات",
      color: "#10b981",
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-safe" dir="rtl">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* التنبيهات */}
        <div className="space-y-2 mb-4 sm:mb-6">
          {stats.lowStockProducts > 0 && !dismissedAlerts.includes('low-stock') && (
            <AlertBanner
              title="تنبيه: مخزون منخفض"
              message={`يوجد ${stats.lowStockProducts} منتج بمخزون منخفض يحتاج إلى إعادة تموين`}
              type="warning"
              onDismiss={() => setDismissedAlerts(prev => [...prev, 'low-stock'])}
            />
          )}

          {stats.pendingOrders > 0 && !dismissedAlerts.includes('pending-orders') && (
            <AlertBanner
              title="أوامر شراء معلقة"
              message={`يوجد ${stats.pendingOrders} أمر شراء في انتظار التنفيذ`}
              type="info"
              onDismiss={() => setDismissedAlerts(prev => [...prev, 'pending-orders'])}
            />
          )}
        </div>

        {/* البطاقات الرئيسية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs opacity-80">
                {stats.lowStockProducts > 0 && `${stats.lowStockProducts} بمخزون منخفض`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مبيعات اليوم</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{formatCurrencySimple(stats.todaySales)}</div>
              <p className="text-xs opacity-80">
                من إجمالي {formatCurrencySimple(stats.totalSales)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{formatCurrencySimple(stats.totalProfit)}</div>
              <p className="text-xs opacity-80">
                هامش ربح {stats.totalSales > 0 ? ((stats.totalProfit / stats.totalSales) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أوامر شراء معلقة</CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs opacity-80">
                {stats.pendingOrders > 0 ? 'يحتاج متابعة' : 'جميع الأوامر منفذة'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* رسم المبيعات الأخيرة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                المبيعات خلال آخر 7 أيام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.recentSales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* توزيع الفئات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                توزيع المنتجات حسب الفئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {stats.categoryDistribution.map((item, index) => {
                  const percentage = stats.totalProducts > 0 ? (item.count / stats.totalProducts) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 ml-2">{item.category}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 sm:w-12 text-left">{item.count}</span>
                      </div>
                    </div>
                  );
                })}
                {stats.categoryDistribution.length === 0 && (
                  <p className="text-center text-gray-500 py-4">لا توجد منتجات بعد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* المنتجات بمخزون منخفض */}
        {stats.lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                منتجات بمخزون منخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-yellow-50">
                        <th className="p-2 sm:p-3 border border-gray-300 text-right font-semibold text-yellow-800 text-sm">المنتج</th>
                        <th className="p-2 sm:p-3 border border-gray-300 text-right font-semibold text-yellow-800 text-sm">الفئة</th>
                        <th className="p-2 sm:p-3 border border-gray-300 text-right font-semibold text-yellow-800 text-sm">المخزون</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 sm:p-3 border border-gray-300 font-medium text-sm">{item.name}</td>
                          <td className="p-2 sm:p-3 border border-gray-300 text-sm">{item.category}</td>
                          <td className="p-2 sm:p-3 border border-gray-300 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {item.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
