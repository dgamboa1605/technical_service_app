import { useState, useEffect, useMemo } from "react";
import type { Product } from "../../domain/entities/Product";
import { GetAllProductsUseCase } from "../../application";
import { useRepositories } from "../../context/RepositoriesContext";

interface ProductSelectorProps {
  clientId: number | null;
  onProductSelected: (product: Product | null) => void;
  onNewProduct: () => void;
}

export default function ProductSelector({ clientId, onProductSelected, onNewProduct }: ProductSelectorProps) {
  const { productRepository } = useRepositories();
  const [clientProducts, setClientProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const getAllProductsUseCase = useMemo(() => new GetAllProductsUseCase(productRepository), [productRepository]);

  useEffect(() => {
    if (clientId) {
      loadClientProducts();
    } else {
      setClientProducts([]);
      setSelectedProduct(null);
    }
  }, [clientId, getAllProductsUseCase]);

  const loadClientProducts = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const allProducts = await getAllProductsUseCase.execute();
      const filtered = allProducts.filter(p => p.clientId === clientId);
      setClientProducts(filtered);
    } catch (error) {
      console.error("Error loading client products:", error);
      setClientProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDropdown(false);
    onProductSelected(product);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    onProductSelected(null);
  };

  if (!clientId) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Primero selecciona un cliente para ver sus productos
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando productos del cliente...
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Producto <span className="text-red-500">*</span>
      </label>

      <div className="flex gap-2">
        {clientProducts.length > 0 ? (
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={!!selectedProduct}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
            >
              {selectedProduct ? (
                <span>{selectedProduct.itemType} - {selectedProduct.brand} {selectedProduct.model}</span>
              ) : (
                <span className="text-gray-400">Seleccionar producto existente...</span>
              )}
            </button>

            {selectedProduct && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {showDropdown && !selectedProduct && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {clientProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.itemType} - {product.brand}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Modelo: {product.model} | S/N: {product.serialNumber}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Este cliente no tiene productos registrados
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onNewProduct}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          title="Registrar nuevo producto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Info del producto seleccionado */}
      {selectedProduct && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {selectedProduct.itemType} - {selectedProduct.brand} {selectedProduct.model}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                <div>S/N: {selectedProduct.serialNumber}</div>
                {selectedProduct.warranty && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Con garantía
                    {selectedProduct.guaranteeingBrand && ` - ${selectedProduct.guaranteeingBrand}`}
                  </div>
                )}
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              ID: {selectedProduct.id}
            </span>
          </div>
        </div>
      )}

      {clientProducts.length > 0 && !selectedProduct && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Este cliente tiene {clientProducts.length} producto{clientProducts.length !== 1 ? 's' : ''} registrado{clientProducts.length !== 1 ? 's' : ''}. Selecciona uno existente o registra uno nuevo.
        </div>
      )}
    </div>
  );
}
