
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import PurchaseOrders from "./pages/PurchaseOrders";
import Purchases from "./pages/Purchases";
import DailySales from "./pages/DailySales";
import Inventory from "./pages/Inventory";
import Analysis from "./pages/Analysis";
import SalesHistory from "./pages/SalesHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Index />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/purchase-orders" element={
            <ProtectedRoute>
              <Layout>
                <PurchaseOrders />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute>
              <Layout>
                <Purchases />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/daily-sales" element={
            <ProtectedRoute>
              <Layout>
                <DailySales />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute>
              <Layout>
                <Analysis />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/sales-history" element={
            <ProtectedRoute>
              <Layout>
                <SalesHistory />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
