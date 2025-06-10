
import React, { useState, useMemo } from 'react';
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import SalesCard from "@/components/sales/SalesCard";
import SalesStats from "@/components/sales/SalesStats";
import SalesFilters from "@/components/sales/SalesFilters";
import { useSalesData } from "@/hooks/useSalesData";

const SalesHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: sales = [], isLoading, error, refetch, isRefetching } = useSalesData();

  // تصفية البيانات
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = !searchTerm || 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const saleDate = new Date(sale.sale_date);
      const matchesStartDate = !startDate || 
        saleDate >= new Date(startDate);
      
      const matchesEndDate = !endDate || 
        saleDate <= new Date(endDate);

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [sales, searchTerm, startDate, endDate]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const averageSale = totalSales > 0 ? totalAmount / totalSales : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = filteredSales.filter(sale => 
      sale.sale_date === today
    ).length;

    return { totalSales, totalAmount, averageSale, todaySales };
  }, [filteredSales]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جارٍ تحميل سجل المبيعات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ خطأ في تحميل المبيعات:', error);
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            حدث خطأ في تحميل سجل المبيعات. يرجى المحاولة مرة أخرى.
            <br />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="mt-2"
            >
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">سجل المبيعات</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع عمليات البيع</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          {isRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          تحديث البيانات
        </Button>
      </div>

      <SalesStats {...stats} />
      
      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {sales.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد مبيعات</h3>
          <p className="text-gray-500">لم يتم تسجيل أي عمليات بيع بعد</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-500">لا توجد مبيعات تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            عرض {filteredSales.length} من {sales.length} عملية بيع
          </div>
          {filteredSales.map((sale) => (
            <SalesCard key={sale.id} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
