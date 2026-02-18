import { Modal } from '../../../ui/modal';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  saving: boolean;
}

export function NoteModal({ isOpen, onClose, value, onChange, onAdd, saving }: NoteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900 m-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Agregar bitácora</h3>
      <textarea
        className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        rows={4}
        placeholder="Nota"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200">
          Cancelar
        </button>
        <button type="button" onClick={onAdd} disabled={saving || !value.trim()} className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50">
          Agregar
        </button>
      </div>
    </Modal>
  );
}
