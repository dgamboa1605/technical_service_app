import { Modal } from '../../../ui/modal';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export function ReportModal({ isOpen, onClose, value, onChange, onSave, saving }: ReportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-xl rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900 m-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Editar informe técnico</h3>
      <textarea
        className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200">
          Cancelar
        </button>
        <button type="button" onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          Guardar
        </button>
      </div>
    </Modal>
  );
}
