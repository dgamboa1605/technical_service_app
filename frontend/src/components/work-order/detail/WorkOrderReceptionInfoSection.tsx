import type { WorkOrder } from '../../../domain/entities/WorkOrder';

interface WorkOrderReceptionInfoSectionProps {
  order: WorkOrder;
  /** Optional title override */
  title?: string;
}

/**
 * Single reusable section for "Información de Recepción":
 * Indicaciones del Cliente, Observaciones, Estado del Artículo, Accesorios Entregados.
 */
export function WorkOrderReceptionInfoSection({ order, title = 'Información de Recepción' }: WorkOrderReceptionInfoSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className="border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-r">
        <h3 className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase mb-1">Indicaciones del Cliente</h3>
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {order.customerInstructions || 'Sin indicaciones'}
        </p>
      </div>

      <div className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-r">
        <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-1">Observaciones</h3>
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {order.observations || 'Sin observaciones'}
        </p>
      </div>

      <div className="border-l-4 border-slate-400 bg-slate-50 dark:bg-slate-900/20 p-2 rounded-r">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Estado del Artículo</h3>
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {order.itemCondition || 'No especificado'}
        </p>
      </div>

      <div className="border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-r">
        <h3 className="text-xs font-bold text-green-800 dark:text-green-300 uppercase mb-1">Accesorios Entregados</h3>
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {order.deliveredAccessories || 'Ninguno'}
        </p>
      </div>
    </section>
  );
}
