import type { WorkOrder } from '../../../domain/entities/WorkOrder';

interface WorkOrderTechnicalReportSectionProps {
  order: WorkOrder;
  canEdit: boolean;
  onEditReport: () => void;
}

export function WorkOrderTechnicalReportSection({ order, canEdit, onEditReport }: WorkOrderTechnicalReportSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Diagnóstico Técnico</h2>
      </div>
      <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50/50 dark:bg-blue-900/10 flex-1 mb-3">
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[120px]">
          {order.technicalReport || (
            <span className="text-gray-500 dark:text-gray-400 italic">
              Sin informe técnico. El técnico debe completar esta sección con el diagnóstico detallado.
            </span>
          )}
        </div>
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={onEditReport}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {order.technicalReport ? 'Editar informe técnico' : 'Agregar informe técnico'}
        </button>
      )}
    </section>
  );
}
