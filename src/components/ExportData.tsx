
import React, { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ExportData = () => {
  const [exportType, setExportType] = useState<'sales' | 'products' | 'orders'>('sales');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "لا توجد بيانات للتصدير",
        description: "لم يتم العثور على بيانات في الفترة المحددة",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      let data: any[] = [];
      let filename = '';

      switch (exportType) {
        case 'sales':
          const { data: salesData } = await supabase
            .from('sales')
            .select(`
              id,
              sale_date,
              total_amount,
              created_at,
              sale_items (
                quantity,
                unit_price,
                total_price,
                products (name, category)
              )
            `)
            .eq('user_id', user.id)
            .gte('sale_date', dateRange.from)
            .lte('sale_date', dateRange.to)
            .order('sale_date', { ascending: false });

          data = salesData?.flatMap(sale => 
            sale.sale_items.map(item => ({
              'تاريخ البيع': format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: ar }),
              'اسم المنتج': item.products?.name || 'غير محدد',
              'الفئة': item.products?.category || 'غير محدد',
              'الكمية': item.quantity,
              'سعر الوحدة': item.unit_price,
              'إجمالي السعر': item.total_price,
              'إجمالي البيع': sale.total_amount,
              'وقت الإنشاء': format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })
            }))
          ) || [];
          filename = 'sales_report';
          break;

        case 'products':
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id);

          data = productsData?.map(product => ({
            'اسم المنتج': product.name,
            'الفئة': product.category,
            'سعر الشراء': product.purchase_price,
            'سعر البيع': product.selling_price,
            'كمية المخزون': product.stock_quantity,
            'الوحدة': product.unit,
            'تاريخ الإنشاء': format(new Date(product.created_at), 'dd/MM/yyyy', { locale: ar })
          })) || [];
          filename = 'products_report';
          break;

        case 'orders':
          const { data: ordersData } = await supabase
            .from('purchase_orders')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', dateRange.from)
            .lte('created_at', dateRange.to);

          data = ordersData?.map(order => ({
            'اسم المنتج': order.item_name,
            'الكمية': order.quantity,
            'سعر الشراء': order.purchase_price || 'غير محدد',
            'سعر البيع': order.selling_price || 'غير محدد',
            'حالة الشراء': order.is_purchased ? 'مُنفذ' : 'معلق',
            'تاريخ الشراء': order.purchase_date ? format(new Date(order.purchase_date), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد',
            'ملاحظات': order.notes || 'لا توجد',
            'تاريخ الإنشاء': format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ar })
          })) || [];
          filename = 'purchase_orders_report';
          break;
      }

      exportToCSV(data, filename);
      
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${data.length} سجل إلى ملف CSV`,
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          تصدير البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">نوع البيانات</label>
            <Select value={exportType} onValueChange={(value: 'sales' | 'products' | 'orders') => setExportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع البيانات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">تقرير المبيعات</SelectItem>
                <SelectItem value="products">تقرير المنتجات</SelectItem>
                <SelectItem value="orders">تقرير أوامر الشراء</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'جارٍ التصدير...' : 'تصدير إلى CSV'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportData;
