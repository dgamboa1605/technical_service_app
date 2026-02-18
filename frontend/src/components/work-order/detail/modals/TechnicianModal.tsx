import type { User } from '../../../../domain/entities/User';
import { Modal } from '../../../ui/modal';

interface TechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicians: User[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAssign: () => void;
  saving: boolean;
}

export function TechnicianModal({ isOpen, onClose, technicians, selectedId, onSelect, onAssign, saving }: TechnicianModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900 m-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Asignar Técnico</h3>
      <div className="space-y-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">Selecciona un técnico</label>
        <select
          className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.username}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200">
          Cancelar
        </button>
        <button type="button" onClick={onAssign} disabled={saving || !selectedId} className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50">
          Asignar
        </button>
      </div>
    </Modal>
  );
}
