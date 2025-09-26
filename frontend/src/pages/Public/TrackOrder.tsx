import { useState } from "react";

// Tipo para los datos de la orden
interface OrderData {
  id: string;
  status: string;
  productName: string;
  issueDescription: string;
  dateCreated: string;
  estimatedCompletion: string;
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setError("");
    
    try {
      // Aquí irá la llamada al API para buscar la orden
      // const response = await searchOrder(orderNumber);
      // setOrderData(response);
      
      // Por ahora, simulamos una búsqueda
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      setOrderData({
        id: orderNumber,
        status: "En Progreso",
        productName: "Laptop HP Pavilion",
        issueDescription: "No enciende",
        dateCreated: "2024-09-20",
        estimatedCompletion: "2024-09-27"
      });
    } catch (err) {
      setError("No se encontró una orden con ese número. Verifique e intente nuevamente.");
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header de la página */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Rastrear mi Orden de Servicio
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Ingrese el número de su orden para ver el estado actual del servicio
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="orderNumber" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Orden
            </label>
            <div className="relative">
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: ORD-2024-0001"
                className="w-full px-4 py-3 pr-12 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500"
                disabled={isLoading}
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading || !orderNumber.trim()}
              className="px-6 py-3 font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {isLoading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 mb-6 text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Resultados de la búsqueda */}
      {orderData && (
        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Detalles de su Orden #{orderData.id}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Estado</h3>
              <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {orderData.status}
              </span>
            </div>
            
            <div>
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Producto</h3>
              <p className="text-gray-900 dark:text-white">{orderData.productName}</p>
            </div>
            
            <div>
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Problema Reportado</h3>
              <p className="text-gray-900 dark:text-white">{orderData.issueDescription}</p>
            </div>
            
            <div>
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Fecha de Ingreso</h3>
              <p className="text-gray-900 dark:text-white">{orderData.dateCreated}</p>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Fecha Estimada de Entrega</h3>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">{orderData.estimatedCompletion}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Información Adicional</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Si tiene preguntas sobre su orden o necesita más información, por favor comuníquese con nuestro equipo de atención al cliente.
            </p>
          </div>
        </div>
      )}

      {/* Información para empleados/admin */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Eres empleado o administrador? 
          <a href="/signin" className="ml-1 font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
            Iniciar sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}