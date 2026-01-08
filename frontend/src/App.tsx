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
import UserProfiles from "./pages/UserProfiles";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { RoleProtectedRoute } from "./components/common/RoleProtectedRoute";

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

          {/* Rutas Administrativas - Solo para empleados/admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* Rutas accesibles para todos los empleados */}
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<UserProfiles />} />
            <Route path="orders" element={<WorkOrders />} />
            <Route path="orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="orders/:id/invoice" element={<WorkOrderInvoicePage />} />
            
            {/* Rutas solo para administradores */}
            <Route path="orders/new" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <NewWorkOrder />
              </RoleProtectedRoute>
            } />
            <Route path="clients" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Clients />
              </RoleProtectedRoute>
            } />
            <Route path="clients/new" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <NewClient />
              </RoleProtectedRoute>
            } />
            <Route path="clients/:id" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ClientDetail />
              </RoleProtectedRoute>
            } />
            <Route path="products" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Products />
              </RoleProtectedRoute>
            } />
            <Route path="products/new" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <NewProduct />
              </RoleProtectedRoute>
            } />
            <Route path="products/:id" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProductDetail />
              </RoleProtectedRoute>
            } />
            <Route path="users" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </RoleProtectedRoute>
            } />
            <Route path="users/new" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <NewUser />
              </RoleProtectedRoute>
            } />
            <Route path="users/:id" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <UserDetail />
              </RoleProtectedRoute>
            } />
          </Route>

          {/* Fallback Route */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}