import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  mobileLabel?: string;
  className?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No se encontraron datos",
  loading = false,
  loadingMessage = "Cargando...",
  onRowClick,
  className = "",
}: ResponsiveTableProps<T>) {
  // Filtrar columnas visibles en móvil
  const mobileColumns = columns.filter(col => !col.hideOnMobile);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
        <div className="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
        <div className="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${column.className || ""}`}
                  >
                    {column.render ? column.render(item) : String((item as any)[column.key] || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              onRowClick ? "cursor-pointer" : ""
            }`}
          >
            {mobileColumns.map((column, index) => {
              const value = column.render ? column.render(item) : String((item as any)[column.key] || "-");
              const isLast = index === mobileColumns.length - 1;

              return (
                <div
                  key={column.key}
                  className={`flex items-start justify-between gap-2 ${!isLast ? "mb-3" : ""}`}
                >
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white text-right flex-1 break-words">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
