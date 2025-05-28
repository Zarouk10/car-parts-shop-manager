
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      {/* شريط التنقل العلوي */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-reverse space-x-8">
              <h1 className="text-xl font-bold text-gray-800">إدارة محل إكسسوارات السيارات</h1>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <Link
                to="/purchase-orders"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                وصل الطلبات
              </Link>
              <Link
                to="/daily-sales"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                البيع اليومي
              </Link>
              <Link
                to="/inventory"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                المخزون
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ترحيب */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            مرحباً بك في نظام إدارة المحل
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نظام شامل لإدارة مخزون إكسسوارات السيارات، تتبع المبيعات اليومية، وإدارة طلبات الشراء
          </p>
        </div>

        {/* بطاقات الميزات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* وصل الطلبات */}
          <Link to="/purchase-orders">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-800">وصل الطلبات</h3>
                    <p className="text-gray-600">إدارة طلبات الشراء</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  تسجيل طلبات شراء الأصناف الجديدة من الموردين وإضافتها للمخزون
                </p>
              </div>
            </div>
          </Link>

          {/* البيع اليومي */}
          <Link to="/daily-sales">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-800">البيع اليومي</h3>
                    <p className="text-gray-600">تسجيل المبيعات</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  تسجيل عمليات البيع اليومية وتحديث المخزون تلقائياً
                </p>
              </div>
            </div>
          </Link>

          {/* المخزون */}
          <Link to="/inventory">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-800">المخزون</h3>
                    <p className="text-gray-600">إدارة الأصناف</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  عرض وإدارة جميع أصناف المخزن مع إمكانية الإضافة والتعديل
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* قسم الإحصائيات السريعة */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-8 w-8 text-blue-600 ml-3" />
            <h3 className="text-2xl font-bold text-gray-800">نظرة سريعة</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
              <div className="text-gray-700">إجمالي الأصناف</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">--</div>
              <div className="text-gray-700">مبيعات اليوم</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">--</div>
              <div className="text-gray-700">أصناف منخفضة المخزون</div>
            </div>
          </div>
        </div>

        {/* تعليمات الاستخدام */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">كيفية البدء:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-bold mb-2">أضف الأصناف</h4>
              <p className="text-blue-100">ابدأ بإضافة أصناف المخزون من قسم "المخزون"</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-bold mb-2">سجل المشتريات</h4>
              <p className="text-blue-100">استخدم "وصل الطلبات" لتسجيل مشترياتك</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-bold mb-2">تتبع المبيعات</h4>
              <p className="text-blue-100">سجل مبيعاتك اليومية من قسم "البيع اليومي"</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
