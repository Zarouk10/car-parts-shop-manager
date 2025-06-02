
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import PurchaseOrders from "./pages/PurchaseOrders";
import Inventory from "./pages/Inventory";
import DailySales from "./pages/DailySales";
import SalesHistory from "./pages/SalesHistory";
import Analysis from "./pages/Analysis";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Purchases from "./pages/Purchases";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/purchase-orders" element={<PurchaseOrders />} />
                      <Route path="/purchases" element={<Purchases />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/daily-sales" element={<DailySales />} />
                      <Route path="/sales-history" element={<SalesHistory />} />
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
