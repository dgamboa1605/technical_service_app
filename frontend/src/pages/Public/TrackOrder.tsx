import { useState, useMemo } from "react";
import type { WorkOrder } from "../../domain/entities/WorkOrder";
import { GetWorkOrderDetailUseCase, ConfirmWorkOrderUseCase } from "../../application";
import { workOrderRepository } from "../../infrastructure/repositories/WorkOrderRepository";

const STATUS_LABEL: Record<string, string> = {
  recibido: "Recibido",
  asignado: "Asignado",
  por_confirmar: "Por confirmar",
  confirmado: "Confirmado",
  en_reparacion: "En reparación",
  completado: "Completado",
  entregado: "Entregado",
};

const STATUS_BADGE: Record<string, string> = {
  recibido: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  asignado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  por_confirmar: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  en_reparacion: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  completado: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  entregado: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<WorkOrder | null>(null);
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const getWorkOrderDetailUseCase = useMemo(() => new GetWorkOrderDetailUseCase(workOrderRepository), []);
  const confirmWorkOrderUseCase = useMemo(() => new ConfirmWorkOrderUseCase(workOrderRepository), []);

  const handleConfirm = async () => {
    if (!orderData || orderData.status !== 'por_confirmar') return;
    
    setIsConfirming(true);
    setError("");
    
    try {
      await confirmWorkOrderUseCase.execute(orderData.id);
      // Recargar la orden
      const updated = await getWorkOrderDetailUseCase.execute(orderData.id);
      if (updated) {
        setOrderData(updated);
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      setError("No se pudo confirmar la orden. Intente nuevamente.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    const orderId = parseInt(orderNumber, 10);
    if (isNaN(orderId)) {
      setError("Por favor ingrese un número de orden válido.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Buscar la orden por ID con detalle completo
      const workOrder = await getWorkOrderDetailUseCase.execute(orderId);
      if (workOrder) {
        setOrderData(workOrder);
      } else {
        setError("No se encontró una orden con ese número. Verifique e intente nuevamente.");
        setOrderData(null);
      }
    } catch (err) {
      console.error('Error searching work order:', err);
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
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Orden #{orderData.id}
              </h2>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_BADGE[orderData.status]}`}>
                {STATUS_LABEL[orderData.status]}
              </span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Producto</h3>
                <p className="text-gray-900 dark:text-white">
                  {orderData.product ? `${orderData.product.itemType} ${orderData.product.brand} ${orderData.product.model}` : '-'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Serie: {orderData.product?.serialNumber || '-'}</p>
              </div>
              
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</h3>
                <p className="text-gray-900 dark:text-white">{orderData.client?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tel: {orderData.client?.phone}</p>
              </div>
              
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Recepción</h3>
                <p className="text-gray-900 dark:text-white">
                  {orderData.receivedDate ? new Date(orderData.receivedDate).toLocaleDateString('es-ES') : '-'}
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Técnico</h3>
                <p className="text-gray-900 dark:text-white">
                  {orderData.technician?.username || 'No asignado'}
                </p>
              </div>
            </div>
          </div>

          {/* Informe Técnico y Repuestos */}
          {(orderData.technicalReport || (orderData.parts && orderData.parts.length > 0) || (orderData.laborCost && orderData.laborCost > 0)) && (
            <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              {orderData.technicalReport && (
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Informe Técnico</h3>
                  <div className="p-4 bg-gray-50 rounded dark:bg-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {orderData.technicalReport}
                    </p>
                  </div>
                </div>
              )}

              {(orderData.laborCost && orderData.laborCost > 0) || (orderData.parts && orderData.parts.length > 0) ? (
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Costos del Servicio</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-2">Descripción</th>
                          <th className="px-4 py-2 text-right">Cantidad</th>
                          <th className="px-4 py-2 text-right">Precio Unit.</th>
                          <th className="px-4 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.laborCost && orderData.laborCost > 0 && (
                          <tr className="border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">Servicio de Reparación / Mano de Obra</td>
                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">1</td>
                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${orderData.laborCost.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                              ${orderData.laborCost.toFixed(2)}
                            </td>
                          </tr>
                        )}
                        {orderData.parts && orderData.parts.map((part) => (
                          <tr key={part.id} className="border-b dark:border-gray-700">
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{part.description}</td>
                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{part.qty}</td>
                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${part.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                              ${(part.qty * part.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold border-t-2 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                          <td colSpan={3} className="px-4 py-3 text-right text-gray-900 dark:text-white text-base">TOTAL:</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white text-lg">
                            ${(
                              (orderData.laborCost || 0) + 
                              (orderData.parts ? orderData.parts.reduce((sum, p) => sum + (p.qty * p.unitPrice), 0) : 0)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Botón de confirmación */}
          {orderData.status === 'por_confirmar' && (
            <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    ¿Desea confirmar esta orden?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Al confirmar, autorizas al técnico a proceder con la reparación según el informe y cotización presentados.
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="px-8 py-3 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming ? 'Confirmando...' : 'Confirmar Orden'}
                </button>
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
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