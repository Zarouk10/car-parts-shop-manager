
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Package, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-reverse space-x-8">
            <h1 className="text-xl font-bold text-gray-800">إدارة محل إكسسوارات السيارات</h1>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-4">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className="flex items-center space-x-reverse space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>الرئيسية</span>
              </Button>
            </Link>
            
            <Link to="/purchase-orders">
              <Button
                variant={isActive('/purchase-orders') ? 'default' : 'ghost'}
                className="flex items-center space-x-reverse space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>وصل الطلبات</span>
              </Button>
            </Link>
            
            <Link to="/daily-sales">
              <Button
                variant={isActive('/daily-sales') ? 'default' : 'ghost'}
                className="flex items-center space-x-reverse space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>البيع اليومي</span>
              </Button>
            </Link>
            
            <Link to="/inventory">
              <Button
                variant={isActive('/inventory') ? 'default' : 'ghost'}
                className="flex items-center space-x-reverse space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>المخزون</span>
              </Button>
            </Link>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-reverse space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
