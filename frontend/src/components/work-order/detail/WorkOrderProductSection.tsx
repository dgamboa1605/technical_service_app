import type { WorkOrder } from '../../../domain/entities/WorkOrder';
import { formatDateTime } from '../../../utils/date';

interface WorkOrderProductSectionProps {
  order: WorkOrder;
}

export function WorkOrderProductSection({ order }: WorkOrderProductSectionProps) {
  const product = order.product;
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Artículo</h2>
      </div>
      <div className="space-y-2">
        <div className="bg-slate-50 dark:bg-slate-900/20 p-2 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Equipo</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {product ? `${product.itemType} ${product.getDisplayName()}` : '-'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{product?.model || '-'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span>Serie: <span className="font-mono font-medium">{product?.serialNumber || '-'}</span></span>
        </div>
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Garantía:</span>
            {product?.warranty ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                CON GARANTÍA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                SIN GARANTÍA
              </span>
            )}
          </div>
          {product?.warranty && product?.guaranteeingBrand && (
            <p className="text-xs text-gray-600 dark:text-gray-400">Marca: {product.guaranteeingBrand}</p>
          )}
          {product?.purchaseDate && (
            <p className="text-xs text-gray-600 dark:text-gray-400">Compra: {formatDateTime(product.purchaseDate)}</p>
          )}
        </div>
      </div>
    </section>
  );
}
