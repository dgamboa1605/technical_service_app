import { Modal } from '../../../ui/modal';

interface PartForm {
  description: string;
  qty: number;
  unit_price: number;
}

interface PartModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: PartForm;
  onPartChange: (part: PartForm) => void;
  onAdd: () => void;
  saving: boolean;
}

export function PartModal({ isOpen, onClose, part, onPartChange, onAdd, saving }: PartModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900 m-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Agregar repuesto</h3>
      <div className="space-y-2">
        <input
          className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Descripción"
          value={part.description}
          onChange={(e) => onPartChange({ ...part, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Cantidad</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={part.qty}
              onChange={(e) => onPartChange({ ...part, qty: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Precio unitario</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={part.unit_price}
              onChange={(e) => onPartChange({ ...part, unit_price: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200">
          Cancelar
        </button>
        <button type="button" onClick={onAdd} disabled={saving || !part.description.trim()} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          Agregar
        </button>
      </div>
    </Modal>
  );
}
