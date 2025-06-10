
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSalesData = () => {
  return useQuery({
    queryKey: ['sales-with-items'],
    queryFn: async () => {
      console.log('🔍 جاري استعلام بيانات المبيعات...');
      
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          sale_date,
          total_amount,
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              unit
            )
          )
        `)
        .order('sale_date', { ascending: false });

      if (salesError) {
        console.error('❌ خطأ في استعلام المبيعات:', salesError);
        throw salesError;
      }

      console.log('✅ تم جلب بيانات المبيعات:', salesData);
      console.log('📊 عدد المبيعات:', salesData?.length || 0);
      
      // التحقق من تفاصيل كل عملية بيع
      salesData?.forEach((sale, index) => {
        console.log(`🛒 البيع ${index + 1}:`, {
          id: sale.id,
          date: sale.sale_date,
          total: sale.total_amount,
          itemsCount: sale.sale_items?.length || 0,
          items: sale.sale_items
        });
      });

      return salesData || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
