
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, BarChart3, DollarSign, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const quickStats = [
    {
      title: 'إجمالي المنتجات',
      value: '0',
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'المبيعات اليوم',
      value: '0 د.ع',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'قائمة التسوق',
      value: '0',
      icon: ShoppingCart,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'تنبيهات المخزون',
      value: '0',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  const quickActions = [
    {
      title: 'إدارة المخزون',
      description: 'عرض وإدارة المنتجات في المخزون',
      icon: Package,
      link: '/inventory',
      color: 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600'
    },
    {
      title: 'قائمة التسوق',
      description: 'إضافة أصناف جديدة لقائمة التسوق',
      icon: ShoppingCart,
      link: '/purchase-orders',
      color: 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600'
    },
    {
      title: 'مبيعات اليوم',
      description: 'تسجيل المبيعات اليومية',
      icon: TrendingUp,
      link: '/daily-sales',
      color: 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600'
    },
    {
      title: 'التحليلات',
      description: 'عرض التقارير والإحصائيات',
      icon: BarChart3,
      link: '/analysis',
      color: 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-4 py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            مرحباً بك في نظام إدارة المخزون
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            إدارة شاملة للمخزون والمبيعات مع واجهة سهلة الاستخدام
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800/50 dark:border-gray-700">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between space-x-2 space-x-reverse">
                    <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} flex-shrink-0`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-center">
            الإجراءات السريعة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="block group"
                >
                  <Card className={`h-full border-2 ${action.color} transition-all duration-200 hover:shadow-lg group-hover:scale-105 dark:bg-gray-800/50`}>
                    <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
                      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <Card className="shadow-sm dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">
              النشاط الأخير
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              آخر العمليات في النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center py-8 sm:py-12">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                لا توجد أنشطة حديثة
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">
                ابدأ باستخدام النظام لرؤية الأنشطة هنا
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
