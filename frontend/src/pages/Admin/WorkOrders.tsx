import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkOrders } from "../../presentation/hooks/useWorkOrders";
import { getStatusLabel } from "../../domain/value-objects/WorkOrderStatus";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";

export default function WorkOrders() {
  // Usar el hook de presentación que encapsula la lógica de negocio
  const { workOrders, isLoading, loadWorkOrders } = useWorkOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Cargar órdenes al montar y leer filtro de estado desde la URL
  useEffect(() => {
    loadWorkOrders();

    const statusFromUrl = searchParams.get("status");
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [loadWorkOrders, searchParams]);

  // Filtrar órdenes por búsqueda y estado
  const filteredOrders = useMemo(() => {
    let filtered = [...workOrders];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(term) ||
        order.client?.name?.toLowerCase().includes(term) ||
        order.product?.brand?.toLowerCase().includes(term) ||
        order.product?.model?.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      // Si el filtro contiene comas, es una lista de estados
      const statuses = statusFilter.split(',');
      filtered = filtered.filter(order => statuses.includes(order.status));
    }

    return filtered;
  }, [workOrders, searchTerm, statusFilter]);

  // Mapear estados al español usando el value object
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      recibido: { label: "Recibido", class: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" },
      asignado: { label: "Asignado", class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      por_confirmar: { label: "Por Confirmar", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      confirmado: { label: "Confirmado", class: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
      en_reparacion: { label: "En Reparación", class: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
      completado: { label: "Completado", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      entregado: { label: "Entregado", class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
    };

    const config = statusConfig[status] || { 
      label: getStatusLabel(status as any), 
      class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" 
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  // Función para buscar orden específica
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <PageMeta title="Gestión de Órdenes de Trabajo" description="Administra y supervisa todas las órdenes de trabajo del sistema" />
      <div className="w-full">
        <PageBreadCrumb pageTitle="Órdenes de Trabajo" />
        {/* Header */}
        <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Órdenes de Trabajo
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Administra y supervisa todas las órdenes de trabajo del sistema
            </p>
          </div>

          {/* Actions Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por número, cliente, marca o modelo..."
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="recibido">Recibido</option>
                  <option value="asignado">Asignado</option>
                  <option value="por_confirmar">Por Confirmar</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="en_reparacion">En Reparación</option>
                  <option value="completado">Completado</option>
                  <option value="entregado">Entregado</option>
                </select>

                {/* New Order Button */}
                <button
                  onClick={() => navigate("/admin/orders/new")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
                >
                  + Nueva Orden
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? (
              "Cargando..."
            ) : (
              <>
                Mostrando <strong>{filteredOrders.length}</strong> de <strong>{workOrders.length}</strong> órdenes
              </>
            )}
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Técnico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Cargando órdenes de trabajo...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron órdenes de trabajo
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.client?.getDisplayName() || "Sin cliente"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.client?.phone || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.product?.itemType || "Sin producto"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.product?.getDisplayName()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.technician?.username || "Sin asignar"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.receivedDate).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Cargando órdenes de trabajo...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de trabajo
                </div>
              ) : (
                filteredOrders.map((order) => (
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
                          {new Date(order.receivedDate).toLocaleDateString("es-ES")}
                        </div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Cliente:</span>
                        <div className="text-sm text-gray-900 dark:text-white text-right flex-1">
                          <div>{order.client?.getDisplayName() || "Sin cliente"}</div>
                          {order.client?.phone && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{order.client.phone}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Producto:</span>
                        <div className="text-sm text-gray-900 dark:text-white text-right flex-1">
                          <div>{order.product?.itemType || "Sin producto"}</div>
                          {order.product?.getDisplayName() && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{order.product.getDisplayName()}</div>
                          )}
                        </div>
                      </div>
                      {order.technician && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Técnico:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                            {order.technician.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>
    </>
  );
}
