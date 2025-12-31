import type { WorkOrderDetail } from "../../services/api";

interface WorkOrderInvoiceProps {
  order: WorkOrderDetail;
}

export default function WorkOrderInvoice({ order }: WorkOrderInvoiceProps) {
  const partsTotal = order.parts.reduce((sum, p) => sum + p.total, 0);
  const grandTotal = partsTotal + (order.labor_cost || 0);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white p-8 dark:bg-gray-800 print:bg-white print:p-8">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6 print:border-gray-900">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:text-gray-900">SERVICIO TÉCNICO</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 print:text-gray-600">Factura / Recibo de Reparación</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">#{order.id}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">{formatDate(order.received_date)}</p>
          </div>
        </div>
      </div>

      {/* Client & Equipment Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2 border-b pb-1 print:text-gray-700">Datos del Cliente</h2>
          <div className="text-sm text-gray-900 dark:text-gray-200 space-y-1 print:text-gray-900">
            <p className="font-bold">{order.client?.name}</p>
            <p>Doc: {order.client?.document_number || 'N/A'}</p>
            <p>Tel: {order.client?.phone}</p>
            {order.client?.email && <p>Email: {order.client.email}</p>}
            {order.client?.address && <p>Dir: {order.client.address}</p>}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2 border-b pb-1 print:text-gray-700">Datos del Equipo</h2>
          <div className="text-sm text-gray-900 dark:text-gray-200 space-y-1 print:text-gray-900">
            <p className="font-bold">
              {order.product?.item_type} {order.product?.brand}
            </p>
            <p>{order.product?.model}</p>
            <p>Serie: {order.product?.serial_number}</p>
            {order.product?.warranty && (
              <p className="font-semibold">✓ CON GARANTÍA</p>
            )}
            {order.technician && <p>Técnico: {order.technician.username}</p>}
          </div>
        </div>
      </div>

      {/* Problem Description */}
      {order.customer_instructions && (
        <div className="mb-4 border-l-4 border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 print:bg-gray-50 print:border-gray-600">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1 print:text-gray-700">Falla Reportada</h2>
          <p className="text-sm text-gray-900 dark:text-gray-200 print:text-gray-900">{order.customer_instructions}</p>
        </div>
      )}

      {/* Technical Report */}
      {order.technical_report && (
        <div className="mb-6 border-l-4 border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 print:bg-gray-50 print:border-gray-600">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1 print:text-gray-700">Informe Técnico</h2>
          <p className="text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap print:text-gray-900">
            {order.technical_report}
          </p>
        </div>
      )}

      {/* Costs Table */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2 border-b-2 pb-1 print:text-gray-700">Detalle de Costos</h2>
        <table className="w-full text-sm border border-gray-300 dark:border-gray-600 print:border-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
            <tr>
              <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 print:text-gray-700 print:border-gray-300">Descripción</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 print:text-gray-700 print:border-gray-300">Cant.</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 print:text-gray-700 print:border-gray-300">P. Unit.</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 print:text-gray-700 print:border-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Labor Cost */}
            {order.labor_cost && order.labor_cost > 0 && (
              <tr className="border-b border-gray-300 dark:border-gray-600 print:border-gray-300">
                <td className="py-2 px-3 text-gray-900 dark:text-gray-200 print:text-gray-900">
                  <strong>Servicio de Reparación / Mano de Obra</strong>
                </td>
                <td className="text-center text-gray-900 dark:text-gray-200 print:text-gray-900">1</td>
                <td className="text-right text-gray-900 dark:text-gray-200 print:text-gray-900">${order.labor_cost.toFixed(2)}</td>
                <td className="text-right font-bold text-gray-900 dark:text-gray-200 print:text-gray-900">${order.labor_cost.toFixed(2)}</td>
              </tr>
            )}
            
            {/* Parts */}
            {order.parts.map((part) => (
              <tr key={part.id} className="border-b border-gray-300 dark:border-gray-600 print:border-gray-300">
                <td className="py-2 px-3 text-gray-900 dark:text-gray-200 print:text-gray-900">{part.description}</td>
                <td className="text-center text-gray-900 dark:text-gray-200 print:text-gray-900">{part.qty}</td>
                <td className="text-right text-gray-900 dark:text-gray-200 print:text-gray-900">${part.unit_price.toFixed(2)}</td>
                <td className="text-right font-semibold text-gray-900 dark:text-gray-200 print:text-gray-900">${part.total.toFixed(2)}</td>
              </tr>
            ))}

            {/* Totals */}
            <tr className="bg-gray-900 dark:bg-gray-700 text-white print:bg-gray-900 print:text-white">
              <td colSpan={3} className="py-3 px-3 text-right font-bold text-base">TOTAL A PAGAR:</td>
              <td className="py-3 px-3 text-right font-bold text-xl">${grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-8 print:border-gray-300">
        <div className="grid grid-cols-2 gap-6 text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">
          <div>
            <p className="font-semibold mb-1">Condiciones del Servicio:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Garantía de 30 días en reparación realizada</li>
              <li>Garantía de repuestos según fabricante</li>
              <li>No incluye daños por mal uso o accidentes</li>
            </ul>
          </div>
          <div className="text-right">
            <p className="mb-2">Estado: <span className="font-semibold uppercase">{order.status.replace('_', ' ')}</span></p>
            {order.assigned_date && (
              <p>Fecha asignación: {formatDate(order.assigned_date)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-gray-300 dark:border-gray-600 print:border-gray-300">
        <div className="text-center">
          <div className="border-t border-gray-400 dark:border-gray-500 pt-2 print:border-gray-400">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 print:text-gray-700">Firma del Cliente</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-500">{order.client?.name}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 dark:border-gray-500 pt-2 print:border-gray-400">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 print:text-gray-700">Firma del Técnico</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-500">{order.technician?.username || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
