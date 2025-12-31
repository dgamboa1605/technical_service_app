import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { workOrdersApi, type WorkOrderDetail } from "../../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const byStatus = workOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const pendientes = (byStatus.recibido || 0) + (byStatus.asignado || 0) + (byStatus.por_confirmar || 0);
    const enProgreso = (byStatus.confirmado || 0) + (byStatus.en_reparacion || 0);
    const completadas = byStatus.completado || 0;
    const entregadas = byStatus.entregado || 0;

    return { pendientes, enProgreso, completadas, entregadas, total: workOrders.length };
  }, [workOrders]);

  // Cargar órdenes al montar el componente
  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        const orders = await workOrdersApi.getAllWithDetails(0, 100);
        setWorkOrders(orders);
      } catch (error) {
        console.error('Error loading work orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkOrders();
  }, []);

  // Función para buscar orden específica
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const orderId = parseInt(searchTerm, 10);
    if (isNaN(orderId)) {
      return;
    }

    try {
      const order = await workOrdersApi.getDetail(orderId);
      setWorkOrders([order]); // Mostrar solo la orden encontrada
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching work order:', error);
    }
  };

  // Función para resetear la búsqueda
  const resetSearch = async () => {
    setSearchTerm("");
    setIsLoading(true);
    try {
      const orders = await workOrdersApi.getAllWithDetails(0, 100);
      setWorkOrders(orders);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mapear estados al español
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      recibido: { label: "Recibido", class: "bg-slate-100 text-slate-800" },
      asignado: { label: "Asignado", class: "bg-cyan-100 text-cyan-800" },
      por_confirmar: { label: "Por confirmar", class: "bg-gray-100 text-gray-800" },
      confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800" },
      en_reparacion: { label: "En reparación", class: "bg-amber-100 text-amber-800" },
      completado: { label: "Completado", class: "bg-green-100 text-green-800" },
      entregado: { label: "Entregado", class: "bg-slate-200 text-slate-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      class: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Bienvenido, {user?.username}. Gestiona las órdenes de trabajo y la información del sistema.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Órdenes pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendientes}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En progreso</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enProgreso}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completadas}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entregadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.entregadas}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
              <svg className="w-6 h-6 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Orders Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Buscar Orden de Trabajo
          </h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Número de orden (ej: 1, 2, 3...)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
            {searchTerm && (
              <button 
                type="button"
                onClick={resetSearch}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gestión de Órdenes de Trabajo
            </h2>
            <Link 
              to="/admin/orders/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Orden
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Número de Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Cargando órdenes...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No se encontraron órdenes de trabajo.
                  </td>
                </tr>
              ) : (
                (() => {
                  // Calcular índices para la paginación
                  const indexOfLastItem = currentPage * itemsPerPage;
                  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                  const currentItems = workOrders.slice(indexOfFirstItem, indexOfLastItem);
                  
                  return currentItems.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {order.client?.name || 'Sin cliente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {order.product ? `${order.product.item_type} ${order.product.brand}` : 'Sin producto'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(order.received_date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando{" "}
              <span className="font-medium">
                {workOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{" "}
              a{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, workOrders.length)}
              </span>{" "}
              de <span className="font-medium">{workOrders.length}</span> resultados
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {(() => {
                const totalPages = Math.ceil(workOrders.length / itemsPerPage);
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= currentPage - 1 && i <= currentPage + 1)
                  ) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          currentPage === i
                            ? "bg-blue-600 text-white border-blue-600"
                            : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  } else if (i === currentPage - 2 || i === currentPage + 2) {
                    pages.push(
                      <span key={i} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }
                return pages;
              })()}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(workOrders.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(workOrders.length / itemsPerPage)}
                className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}