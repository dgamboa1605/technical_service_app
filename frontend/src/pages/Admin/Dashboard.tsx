import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkOrders } from "../../presentation/hooks/useWorkOrders";
import { getStatusLabel } from "../../domain/value-objects/WorkOrderStatus";
import type { WorkOrder } from "../../domain/entities/WorkOrder";

export default function Dashboard() {
  const { user } = useAuth();
  const { workOrders, isLoading, stats, getWorkOrderById, loadWorkOrders } = useWorkOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>(workOrders);
  const navigate = useNavigate();

  // Cargar órdenes al montar el componente
  useEffect(() => {
    loadWorkOrders(0, 100);
  }, [loadWorkOrders]);

  // Actualizar órdenes filtradas cuando cambian las órdenes
  useEffect(() => {
    setFilteredOrders(workOrders);
  }, [workOrders]);

  // Función para buscar orden específica
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const orderId = parseInt(searchTerm, 10);
    if (isNaN(orderId)) {
      return;
    }

    const order = await getWorkOrderById(orderId);
    if (order) {
      setFilteredOrders([order]); // Mostrar solo la orden encontrada
      setCurrentPage(1);
    }
  };

  // Función para resetear la búsqueda
  const resetSearch = () => {
    setSearchTerm("");
    setFilteredOrders(workOrders);
    setCurrentPage(1);
    loadWorkOrders(0, 100);
  };

  // Mapear estados al español usando value object
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      recibido: { label: "Recibido", class: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" },
      asignado: { label: "Asignado", class: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
      por_confirmar: { label: "Por confirmar", class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" },
      confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      en_reparacion: { label: "En reparación", class: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
      completado: { label: "Completado", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      entregado: { label: "Entregado", class: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200" },
    };

    const config = statusConfig[status] || {
      label: getStatusLabel(status as any),
      class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Bienvenido, {user?.username}. Gestiona las órdenes de trabajo y la información del sistema.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Órdenes pendientes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendientes}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">En progreso</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.enProgreso}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.completadas}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Entregadas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.entregadas}</p>
            </div>
            <div className="p-2 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Orders Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Buscar Orden de Trabajo
          </h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Número de orden (ej: 1, 2, 3...)"
                className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button 
                type="submit"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Buscar</span>
              </button>
              {searchTerm && (
                <button 
                  type="button"
                  onClick={resetSearch}
                  className="px-4 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Gestión de Órdenes de Trabajo
            </h2>
            <Link 
              to="/admin/orders/new"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Orden
            </Link>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
              ) : filteredOrders.length === 0 ? (
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
                  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
                  
                  return currentItems.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {order.client?.getDisplayName() || 'Sin cliente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {order.product ? `${order.product.itemType} ${order.product.getDisplayName()}` : 'Sin producto'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(order.receivedDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Cargando órdenes...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No se encontraron órdenes de trabajo.
            </div>
          ) : (
            (() => {
              const indexOfLastItem = currentPage * itemsPerPage;
              const indexOfFirstItem = indexOfLastItem - itemsPerPage;
              const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
              
              return currentItems.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Orden #{order.id}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.receivedDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Cliente:</span>
                      <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                        {order.client?.getDisplayName() || 'Sin cliente'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Producto:</span>
                      <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                        {order.product ? `${order.product.itemType} ${order.product.getDisplayName()}` : 'Sin producto'}
                      </span>
                    </div>
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Mostrando{" "}
              <span className="font-medium">
                {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{" "}
              a{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
              </span>{" "}
              de <span className="font-medium">{filteredOrders.length}</span> resultados
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {(() => {
                const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
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
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md ${
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
                      <span key={i} className="px-1 sm:px-2 text-xs sm:text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                }
                return pages;
              })()}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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