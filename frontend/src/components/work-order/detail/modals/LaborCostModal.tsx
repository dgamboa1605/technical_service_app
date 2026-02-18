import { Modal } from '../../../ui/modal';

interface LaborCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (value: number) => void;
  onSave: () => void;
  saving: boolean;
}

export function LaborCostModal({ isOpen, onClose, value, onChange, onSave, saving }: LaborCostModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900 m-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Costo de Servicio / Mano de Obra</h3>
      <div className="space-y-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">Ingrese el costo del servicio</label>
        <input
          type="number"
          min={0}
          step={0.01}
          className="w-full rounded border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0.00"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Este es el costo del trabajo de reparación, no incluye repuestos
        </p>
      </div>
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
