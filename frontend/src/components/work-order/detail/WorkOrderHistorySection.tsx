import type { WorkOrder } from '../../../domain/entities/WorkOrder';
import { getStatusLabel } from '../../../domain/value-objects/WorkOrderStatus';
import { formatDateTime } from '../../../utils/date';

interface WorkOrderHistorySectionProps {
  order: WorkOrder;
  onAddNote: () => void;
}

export function WorkOrderHistorySection({ order, onAddNote }: WorkOrderHistorySectionProps) {
  const history = order.history ?? [];
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
      <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        Historial y Bitácora
      </h2>
      <div className="space-y-2 overflow-y-auto mb-3 flex-1">
        {history.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Sin registros</p>
        )}
        {history.map((h) => (
          <div key={h.id} className="rounded border border-gray-100 p-2 text-sm dark:border-gray-700">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(h.createdAt)}</p>
              {h.user && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{h.getUserDisplayName()}</p>
              )}
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {h.statusTo ? getStatusLabel(h.statusTo) : 'Nota'}
            </p>
            {h.note && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{h.note}</p>}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddNote}
        className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Agregar bitácora
      </button>
    </section>
  );
}
