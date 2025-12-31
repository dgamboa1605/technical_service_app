import { BrowserRouter as Router, Route, Routes } from "react-router"
import SignIn from "./pages/AuthPages/SignIn";
import AppLayout from "./layout/AppLayout";
import AdminLayout from "./layout/AdminLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Public/Home";
import TrackOrder from "./pages/Public/TrackOrder";
import Services from "./pages/Public/Services";
import FAQ from "./pages/Public/FAQ";
import Contact from "./pages/Public/Contact";
import Dashboard from "./pages/Admin/Dashboard";
import NewWorkOrder from "./pages/Admin/NewWorkOrder";
import WorkOrders from "./pages/Admin/WorkOrders";
import Clients from "./pages/Admin/Clients";
import NewClient from "./pages/Admin/NewClient";
import ClientDetail from "./pages/Admin/ClientDetail";
import Products from "./pages/Admin/Products";
import ProductDetail from "./pages/Admin/ProductDetail";
import NewProduct from "./pages/Admin/NewProduct";
import UserManagement from "./pages/Admin/UserManagement";
import NewUser from "./pages/Admin/NewUser";
import UserDetail from "./pages/Admin/UserDetail";
import WorkOrderDetailPage from "./pages/Admin/WorkOrderDetail";
import WorkOrderInvoicePage from "./pages/Admin/WorkOrderInvoicePage";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Rutas Públicas - Layout público para clientes */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/ordenes" element={<TrackOrder />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contacto" element={<Contact />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Rutas Administrativas - Solo para empleados/admin */}
                    {/* Rutas protegidas para empleados y administradores */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<WorkOrders />} />
            <Route path="orders/new" element={<NewWorkOrder />} />
            <Route path="orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="orders/:id/invoice" element={<WorkOrderInvoicePage />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<NewClient />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<NewProduct />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/new" element={<NewUser />} />
            <Route path="users/:id" element={<UserDetail />} />
            {/* Aquí se agregarán más rutas administrativas */}
          </Route>

          {/* Fallback Route */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}