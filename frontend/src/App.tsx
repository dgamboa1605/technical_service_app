import { BrowserRouter as Router, Route, Routes } from "react-router"
import SignIn from "./pages/AuthPages/SignIn";
import AppLayout from "./layout/AppLayout";
import AdminLayout from "./layout/AdminLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import TrackOrder from "./pages/Public/TrackOrder";
import Dashboard from "./pages/Admin/Dashboard";
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
            <Route index path="/" element={<TrackOrder />} />
            {/* Página principal ahora es para buscar órdenes */}
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
            {/* Aquí se agregarán más rutas administrativas */}
          </Route>

          {/* Fallback Route */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}