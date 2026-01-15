import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../presentation/hooks/useProducts";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";

export default function Products() {
  const { products, isLoading, loadProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.itemType?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      product.model?.toLowerCase().includes(term) ||
      product.serialNumber?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  return (
    <>
      <PageMeta title="Gestión de Productos" description="Administra el inventario de productos" />
      <div className="w-full">
        <PageBreadCrumb pageTitle="Productos" />
        <div className="mb-4 sm:mb-6 mt-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Productos
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Administra el inventario de productos
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por tipo, marca, modelo o número de serie..."
                  className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => navigate("/admin/products/new")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
              >
                + Nuevo Producto
              </button>
            </div>
          </div>

          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? (
              "Cargando..."
            ) : (
              <>Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos</>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Número de Serie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Cargando productos...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron productos
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.itemType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.brand}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.model || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.serialNumber || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}`)}
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
                  Cargando productos...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron productos
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/admin/products/${product.id}`)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {product.itemType}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Marca:</span>
                        <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                          {product.brand}
                        </span>
                      </div>
                      {product.model && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Modelo:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1">
                            {product.model}
                          </span>
                        </div>
                      )}
                      {product.serialNumber && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Número de Serie:</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right flex-1 break-words">
                            {product.serialNumber}
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
