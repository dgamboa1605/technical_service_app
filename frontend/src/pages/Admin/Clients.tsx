import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../../presentation/hooks/useClients";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";

export default function Clients() {
  const { clients, isLoading, loadClients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.documentNumber?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  return (
    <>
      <PageMeta title="Gestión de Clientes" description="Administra la información de tus clientes" />
      <div className="w-full">
        <div className="w-full">
          <PageBreadCrumb pageTitle="Clientes" />
        </div>
        <div className="w-full">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Clientes
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Administra la información de tus clientes
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, email o documento..."
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => navigate("/admin/clients/new")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
              >
                + Nuevo Cliente
              </button>
            </div>
          </div>

          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? (
              "Cargando..."
            ) : (
              <>Mostrando <strong>{filteredClients.length}</strong> de <strong>{clients.length}</strong> clientes</>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron clientes
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.getDisplayName()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.documentNumber || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.phone || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {client.address || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/clients/${client.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Ver
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
                  Cargando clientes...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron clientes
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {client.getDisplayName()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {client.documentNumber && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Documento:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                            {client.documentNumber}
                          </span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Teléfono:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                            {client.phone}
                          </span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Email:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1 break-words">
                            {client.email}
                          </span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Dirección:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1 break-words">
                            {client.address}
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
      </div>
    </>
  );
}
