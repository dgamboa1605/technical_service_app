import type { WorkOrder } from '../../../domain/entities/WorkOrder';

interface WorkOrderCostsAndPartsSectionProps {
  order: WorkOrder;
  partsTotal: number;
  grandTotal: number;
  canEdit: boolean;
  onEditLaborCost: () => void;
  onAddPart: () => void;
}

/**
 * Single reusable section for "Costos y Repuestos": labor cost, parts list, subtotal, total, and edit/add buttons.
 */
export function WorkOrderCostsAndPartsSection({
  order,
  partsTotal,
  grandTotal,
  canEdit,
  onEditLaborCost,
  onAddPart,
}: WorkOrderCostsAndPartsSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
      <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Costos y Repuestos</h2>
      <div className="flex-1 flex flex-col gap-3">
        <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Costo de Servicio / Mano de Obra</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Costo del trabajo de reparación</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${(order.laborCost || 0).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={onEditLaborCost}
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repuestos / Materiales</h3>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {(!order.parts || order.parts.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin repuestos</p>
            )}
            {order.parts?.map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 pb-2 dark:border-gray-700">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{p.description}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.qty} x ${p.unitPrice.toFixed(2)}</p>
                    {p.user && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">• {p.user.username}</span>
                    )}
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">${p.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <span>Subtotal Repuestos</span>
            <span>${partsTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
          <span>TOTAL</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={onAddPart}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors mt-4"
        >
          Agregar repuesto
        </button>
      )}
    </section>
  );
}
