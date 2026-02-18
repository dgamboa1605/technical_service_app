import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRepositories } from '../../context/RepositoriesContext';
import type { WorkOrder } from '../../domain/entities/WorkOrder';
import type { WorkOrderStatus } from '../../domain/value-objects/WorkOrderStatus';
import type { User } from '../../domain/entities/User';
import { ALLOWED_TRANSITIONS } from '../../domain/value-objects/WorkOrderStatus';
import { GetWorkOrderDetailUseCase } from '../../application/use-cases/work-orders/GetWorkOrderDetailUseCase';
import { UpdateWorkOrderStatusUseCase } from '../../application/use-cases/work-orders/UpdateWorkOrderStatusUseCase';
import { UpdateTechnicalReportUseCase } from '../../application/use-cases/work-orders/UpdateTechnicalReportUseCase';
import { AssignTechnicianUseCase } from '../../application/use-cases/work-orders/AssignTechnicianUseCase';
import { UpdateLaborCostUseCase } from '../../application/use-cases/work-orders/UpdateLaborCostUseCase';
import { AddWorkOrderPartUseCase } from '../../application/use-cases/work-orders/AddWorkOrderPartUseCase';
import { AddHistoryUseCase } from '../../application/use-cases/work-orders/AddHistoryUseCase';
import { GetTechniciansUseCase } from '../../application/use-cases/users/GetTechniciansUseCase';

/**
 * Encapsulates work order detail loading, use cases, and all handlers.
 * Keeps the detail page mostly presentational.
 */
export function useWorkOrderDetail(id: string | undefined) {
  const { workOrderRepository, userRepository } = useRepositories();
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [note, setNote] = useState('');
  const [report, setReport] = useState('');
  const [laborCost, setLaborCost] = useState<number>(0);
  const [part, setPart] = useState<{ description: string; qty: number; unit_price: number }>({
    description: '',
    qty: 1,
    unit_price: 0,
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showLaborCostModal, setShowLaborCostModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  const getWorkOrderDetailUseCase = useMemo(() => new GetWorkOrderDetailUseCase(workOrderRepository), [workOrderRepository]);
  const updateWorkOrderStatusUseCase = useMemo(() => new UpdateWorkOrderStatusUseCase(workOrderRepository), [workOrderRepository]);
  const updateTechnicalReportUseCase = useMemo(() => new UpdateTechnicalReportUseCase(workOrderRepository), [workOrderRepository]);
  const assignTechnicianUseCase = useMemo(() => new AssignTechnicianUseCase(workOrderRepository), [workOrderRepository]);
  const updateLaborCostUseCase = useMemo(() => new UpdateLaborCostUseCase(workOrderRepository), [workOrderRepository]);
  const addWorkOrderPartUseCase = useMemo(() => new AddWorkOrderPartUseCase(workOrderRepository), [workOrderRepository]);
  const addHistoryUseCase = useMemo(() => new AddHistoryUseCase(workOrderRepository), [workOrderRepository]);
  const getTechniciansUseCase = useMemo(() => new GetTechniciansUseCase(userRepository), [userRepository]);

  const nextStatuses = useMemo(() => {
    if (!detail) return [];
    return ALLOWED_TRANSITIONS[detail.status] || [];
  }, [detail]);

  const partsTotal = useMemo(() => {
    if (!detail || !detail.parts) return 0;
    return detail.parts.reduce((sum, p) => sum + p.total, 0);
  }, [detail]);

  const grandTotal = useMemo(() => {
    if (!detail) return 0;
    return partsTotal + (detail.laborCost || 0);
  }, [detail, partsTotal]);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getWorkOrderDetailUseCase.execute(Number(id));
      if (data) {
        setDetail(data);
        setReport(data.technicalReport || '');
        setLaborCost(data.laborCost || 0);
      } else {
        setError('Orden no encontrada');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la orden');
    } finally {
      setLoading(false);
    }
  }, [id, getWorkOrderDetailUseCase]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const techs = await getTechniciansUseCase.execute();
        setTechnicians(techs);
      } catch (err) {
        console.error('Error al cargar técnicos:', err);
      }
    };
    loadTechnicians();
  }, [getTechniciansUseCase]);

  const handleAdvanceStatus = useCallback(async (to: WorkOrderStatus) => {
    if (!detail) return;
    setSaving(true);
    try {
      await updateWorkOrderStatusUseCase.execute(detail.id, { status: to, note: note || undefined });
      setNote('');
      await loadDetail();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado');
    } finally {
      setSaving(false);
    }
  }, [detail, note, updateWorkOrderStatusUseCase, loadDetail]);

  const handleUpdateReport = useCallback(async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await updateTechnicalReportUseCase.execute(detail.id, report);
      await loadDetail();
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el informe técnico');
    } finally {
      setSaving(false);
    }
  }, [detail, report, updateTechnicalReportUseCase, loadDetail]);

  const handleAddHistory = useCallback(async () => {
    if (!detail || !note.trim()) return;
    setSaving(true);
    try {
      await addHistoryUseCase.execute(detail.id, { note });
      setNote('');
      await loadDetail();
      setShowNoteModal(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo agregar a la bitácora');
    } finally {
      setSaving(false);
    }
  }, [detail, note, addHistoryUseCase, loadDetail]);

  const handleAddPart = useCallback(async () => {
    if (!detail || !part.description.trim()) return;
    setSaving(true);
    try {
      await addWorkOrderPartUseCase.execute(detail.id, {
        description: part.description.trim(),
        qty: part.qty,
        unit_price: part.unit_price,
      });
      setPart({ description: '', qty: 1, unit_price: 0 });
      await loadDetail();
      setShowPartModal(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo agregar el repuesto');
    } finally {
      setSaving(false);
    }
  }, [detail, part, addWorkOrderPartUseCase, loadDetail]);

  const handleAssignTechnician = useCallback(async () => {
    if (!detail || !selectedTechnician) return;
    setSaving(true);
    try {
      await assignTechnicianUseCase.execute(detail.id, parseInt(selectedTechnician));
      setSelectedTechnician('');
      await loadDetail();
      setShowTechnicianModal(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo asignar el técnico');
    } finally {
      setSaving(false);
    }
  }, [detail, selectedTechnician, assignTechnicianUseCase, loadDetail]);

  const handleUpdateLaborCost = useCallback(async (checkCanEdit: () => boolean) => {
    if (!detail) return;
    if (!checkCanEdit()) {
      setError('Solo puedes actualizar el costo de órdenes asignadas a ti');
      return;
    }
    setSaving(true);
    try {
      await updateLaborCostUseCase.execute(detail.id, laborCost);
      await loadDetail();
      setShowLaborCostModal(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el costo de servicio');
    } finally {
      setSaving(false);
    }
  }, [detail, laborCost, updateLaborCostUseCase, loadDetail]);

  return {
    detail,
    loading,
    error,
    loadDetail,
    note,
    setNote,
    report,
    setReport,
    laborCost,
    setLaborCost,
    part,
    setPart,
    showReportModal,
    setShowReportModal,
    showNoteModal,
    setShowNoteModal,
    showPartModal,
    setShowPartModal,
    showTechnicianModal,
    setShowTechnicianModal,
    setSelectedTechnician,
    showLaborCostModal,
    setShowLaborCostModal,
    showInvoiceModal,
    setShowInvoiceModal,
    selectedTechnician,
    technicians,
    saving,
    nextStatuses,
    partsTotal,
    grandTotal,
    handleAdvanceStatus,
    handleUpdateReport,
    handleAddHistory,
    handleAddPart,
    handleAssignTechnician,
    handleUpdateLaborCost,
  };
}
