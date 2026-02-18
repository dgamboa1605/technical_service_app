import type { WorkOrder } from '../../../domain/entities/WorkOrder';
import type { WorkOrderStatus } from '../../../domain/value-objects/WorkOrderStatus';
import { getStatusLabel } from '../../../domain/value-objects/WorkOrderStatus';
import { formatDateTime } from '../../../utils/date';

interface WorkOrderHeaderSectionProps {
  order: WorkOrder;
  nextStatuses: WorkOrderStatus[];
  saving: boolean;
  isAdmin: boolean;
  onAdvanceStatus: (to: WorkOrderStatus) => void;
  onOpenInvoice: () => void;
  onOpenTechnicianModal: () => void;
  onOpenReportModal: () => void;
}

export function WorkOrderHeaderSection({
  order,
  nextStatuses,
  saving,
  isAdmin,
  onAdvanceStatus,
  onOpenInvoice,
  onOpenTechnicianModal,
  onOpenReportModal,
}: WorkOrderHeaderSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 print:hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Nro. Orden</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.id}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recepción: {formatDateTime(order.receivedDate)}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2 justify-end">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
              {getStatusLabel(order.status)}
            </span>
            <button
              type="button"
              onClick={onOpenInvoice}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Factura
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 text-xs font-medium"
            >
              {order.technicalReport ? 'Editar Informe' : 'Agregar Informe'}
            </button>
            {isAdmin && !order.technician && order.status === 'recibido' && (
              <button
                type="button"
                onClick={onOpenTechnicianModal}
                className="px-3 py-1.5 rounded bg-slate-600 text-white hover:bg-slate-700 text-xs font-medium"
              >
                Asignar Técnico
              </button>
            )}
            {nextStatuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onAdvanceStatus(st)}
                disabled={saving}
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
              >
                → {getStatusLabel(st)}
              </button>
            ))}
          </div>
          {order.technician && (
            <p className="text-sm text-gray-600 dark:text-gray-300">Técnico: {order.technician.username}</p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">Tipo: {order.serviceType.toUpperCase()}</p>
        </div>
      </div>
    </section>
  );
}
