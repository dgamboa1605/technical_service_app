import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GetWorkOrderDetailUseCase } from "../../application/use-cases/work-orders/GetWorkOrderDetailUseCase";
import { UpdateWorkOrderStatusUseCase } from "../../application/use-cases/work-orders/UpdateWorkOrderStatusUseCase";
import { UpdateTechnicalReportUseCase } from "../../application/use-cases/work-orders/UpdateTechnicalReportUseCase";
import { AssignTechnicianUseCase } from "../../application/use-cases/work-orders/AssignTechnicianUseCase";
import { UpdateLaborCostUseCase } from "../../application/use-cases/work-orders/UpdateLaborCostUseCase";
import { AddWorkOrderPartUseCase } from "../../application/use-cases/work-orders/AddWorkOrderPartUseCase";
import { AddHistoryUseCase } from "../../application/use-cases/work-orders/AddHistoryUseCase";
import { GetTechniciansUseCase } from "../../application/use-cases/users/GetTechniciansUseCase";
import { workOrderRepository } from "../../infrastructure/repositories/WorkOrderRepository";
import { userRepository } from "../../infrastructure/repositories/UserRepository";
import type { WorkOrder } from "../../domain/entities/WorkOrder";
import type { WorkOrderStatus } from "../../domain/value-objects/WorkOrderStatus";
import type { User } from "../../domain/entities/User";
import { getStatusLabel } from "../../domain/value-objects/WorkOrderStatus";
import { ALLOWED_TRANSITIONS } from "../../domain/value-objects/WorkOrderStatus";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import WorkOrderInvoice from "../../components/work-order/WorkOrderInvoice";
import { useAuthorization } from "../../presentation/hooks/useAuthorization";

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, canEditOrder } = useAuthorization();
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [note, setNote] = useState("");
  const [report, setReport] = useState("");
  const [laborCost, setLaborCost] = useState<number>(0);
  const [part, setPart] = useState<{ description: string; qty: number; unit_price: number }>({
    description: "",
    qty: 1,
    unit_price: 0,
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showLaborCostModal, setShowLaborCostModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  // Casos de uso
  const getWorkOrderDetailUseCase = useMemo(() => new GetWorkOrderDetailUseCase(workOrderRepository), []);
  const updateWorkOrderStatusUseCase = useMemo(() => new UpdateWorkOrderStatusUseCase(workOrderRepository), []);
  const updateTechnicalReportUseCase = useMemo(() => new UpdateTechnicalReportUseCase(workOrderRepository), []);
  const assignTechnicianUseCase = useMemo(() => new AssignTechnicianUseCase(workOrderRepository), []);
  const updateLaborCostUseCase = useMemo(() => new UpdateLaborCostUseCase(workOrderRepository), []);
  const addWorkOrderPartUseCase = useMemo(() => new AddWorkOrderPartUseCase(workOrderRepository), []);
  const addHistoryUseCase = useMemo(() => new AddHistoryUseCase(workOrderRepository), []);
  const getTechniciansUseCase = useMemo(() => new GetTechniciansUseCase(userRepository), []);

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

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getWorkOrderDetailUseCase.execute(Number(id));
      if (data) {
        setDetail(data);
        setReport(data.technicalReport || "");
        setLaborCost(data.laborCost || 0);
      } else {
        setError("Orden no encontrada");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la orden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAdvanceStatus = async (to: WorkOrderStatus) => {
    if (!detail) return;
    setSaving(true);
    try {
      await updateWorkOrderStatusUseCase.execute(detail.id, { status: to, note: note || undefined });
      setNote("");
      await loadDetail();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateReport = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await updateTechnicalReportUseCase.execute(detail.id, report);
      await loadDetail();
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el informe técnico");
    } finally {
      setSaving(false);
    }
  };

  const handleAddHistory = async () => {
    if (!detail) return;
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addHistoryUseCase.execute(detail.id, { note });
      setNote("");
      await loadDetail();
      setShowNoteModal(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo agregar a la bitácora");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPart = async () => {
    if (!detail || !part.description.trim()) return;
    setSaving(true);
    try {
      await addWorkOrderPartUseCase.execute(detail.id, {
        description: part.description.trim(),
        qty: part.qty,
        unit_price: part.unit_price,
      });
      setPart({ description: "", qty: 1, unit_price: 0 });
      await loadDetail();
      setShowPartModal(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo agregar el repuesto");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!detail || !selectedTechnician) return;
    setSaving(true);
    try {
      await assignTechnicianUseCase.execute(detail.id, parseInt(selectedTechnician));
      setSelectedTechnician("");
      await loadDetail();
      setShowTechnicianModal(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo asignar el técnico");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const techs = await getTechniciansUseCase.execute();
        setTechnicians(techs);
      } catch (err) {
        console.error("Error al cargar técnicos:", err);
      }
    };
    loadTechnicians();
  }, [getTechniciansUseCase]);

  const handleUpdateLaborCost = async () => {
    if (!detail) return;
    
    // Verificar permisos: employee solo puede editar si es el técnico asignado
    if (!isAdmin && !canEditOrder(detail.technicianId)) {
      setError("Solo puedes actualizar el costo de órdenes asignadas a ti");
      return;
    }
    
    setSaving(true);
    try {
      await updateLaborCostUseCase.execute(detail.id, laborCost);
      await loadDetail();
      setShowLaborCostModal(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el costo de servicio");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  if (!id) {
    return (
      <>
        <PageMeta
          title="Detalle de Orden | Sistema de Servicio Técnico"
          description="Detalle de la orden de trabajo"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle="Detalle de Orden" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-700 dark:text-gray-300">ID de orden inválido.</p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageMeta
          title="Detalle de Orden | Sistema de Servicio Técnico"
          description="Detalle de la orden de trabajo"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle="Detalle de Orden" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-700 dark:text-gray-300">Cargando orden...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta
          title="Detalle de Orden | Sistema de Servicio Técnico"
          description="Detalle de la orden de trabajo"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle="Detalle de Orden" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <p className="text-red-600">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={loadDetail}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            >
              Volver
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!detail) return null;

  return (
    <>
      <div className="print:hidden">
        <PageMeta
          title={`Orden #${detail.id} | Sistema de Servicio Técnico`}
          description="Detalle de la orden de trabajo"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle={`Orden de Trabajo #${detail.id}`} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Sección de encabezado */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nro. Orden</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{detail.id}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recepción: {formatDate(detail.receivedDate)}</p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200`}>
                  {getStatusLabel(detail.status)}
                </span>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir Factura
                </button>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {isAdmin && !detail.technician && detail.status === 'recibido' && (
                  <button
                    onClick={() => setShowTechnicianModal(true)}
                    className="px-3 py-1.5 rounded bg-slate-600 text-white hover:bg-slate-700 text-xs font-medium"
                  >
                    Asignar Técnico
                  </button>
                )}
                {nextStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleAdvanceStatus(st)}
                    disabled={saving}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                  >
                    → {getStatusLabel(st)}
                  </button>
                ))}
              </div>
              {detail.technician && (
                <p className="text-sm text-gray-600 dark:text-gray-300">Técnico: {detail.technician.username}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">Tipo: {detail.serviceType.toUpperCase()}</p>
            </div>
          </div>
        </section>

        {/* Información del artículo, cliente e información de recepción */}
        <div className="grid md:grid-cols-2 gap-3 print:hidden">
          {/* Artículo */}
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
                  {detail.product ? `${detail.product.itemType} ${detail.product.getDisplayName()}` : '-'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{detail.product?.model || '-'}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>Serie: <span className="font-mono font-medium">{detail.product?.serialNumber || '-'}</span></span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Garantía:</span>
                  {detail.product?.warranty ? (
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
                {detail.product?.warranty && detail.product?.guaranteeingBrand && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">Marca: {detail.product.guaranteeingBrand}</p>
                )}
                {detail.product?.purchaseDate && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">Compra: {formatDate(detail.product.purchaseDate)}</p>
                )}
              </div>
            </div>
          </section>

          {/* Cliente (solo admin) o Información de Recepción (employee) */}
          {isAdmin ? (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Cliente</h2>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{detail.client?.getDisplayName()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span>{detail.client?.documentNumber || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{detail.client?.phone}</span>
                </div>
                {detail.client?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{detail.client.email}</span>
                  </div>
                )}
                {detail.client?.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{detail.client.address}</span>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Información de Recepción</h2>
              </div>
              
              <div className="border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase mb-1">Indicaciones del Cliente</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.customerInstructions || 'Sin indicaciones'}
                </p>
              </div>
              
              <div className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-1">Observaciones</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.observations || 'Sin observaciones'}
                </p>
              </div>
              
              <div className="border-l-4 border-slate-400 bg-slate-50 dark:bg-slate-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Estado del Artículo</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.itemCondition || 'No especificado'}
                </p>
              </div>
              
              <div className="border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-green-800 dark:text-green-300 uppercase mb-1">Accesorios Entregados</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.deliveredAccessories || 'Ninguno'}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Información de Recepción (solo admin) o Diagnóstico y Costos (employee) */}
        {isAdmin && (
          <div className="grid md:grid-cols-2 gap-3 print:hidden">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Información de Recepción</h2>
              </div>
              
              <div className="border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase mb-1">Indicaciones del Cliente</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.customerInstructions || 'Sin indicaciones'}
                </p>
              </div>
              
              <div className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-1">Observaciones</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.observations || 'Sin observaciones'}
                </p>
              </div>
              
              <div className="border-l-4 border-slate-400 bg-slate-50 dark:bg-slate-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Estado del Artículo</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.itemCondition || 'No especificado'}
                </p>
              </div>
              
              <div className="border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-r">
                <h3 className="text-xs font-bold text-green-800 dark:text-green-300 uppercase mb-1">Accesorios Entregados</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.deliveredAccessories || 'Ninguno'}
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Diagnóstico Técnico</h2>
              </div>
              
              <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50/50 dark:bg-blue-900/10 flex-1 mb-3">
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[120px]">
                  {detail.technicalReport || (
                    <span className="text-gray-500 dark:text-gray-400 italic">Sin informe técnico. El técnico debe completar esta sección con el diagnóstico detallado.</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {detail.technicalReport ? 'Editar informe técnico' : 'Agregar informe técnico'}
              </button>
            </section>
          </div>
        )}

        {/* Diagnóstico Técnico y Costos (solo employee) */}
        {!isAdmin && (
          <div className="grid md:grid-cols-2 gap-3 print:hidden">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Diagnóstico Técnico</h2>
              </div>
              
              <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50/50 dark:bg-blue-900/10 flex-1 mb-3">
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[120px]">
                  {detail.technicalReport || (
                    <span className="text-gray-500 dark:text-gray-400 italic">Sin informe técnico. El técnico debe completar esta sección con el diagnóstico detallado.</span>
                  )}
                </div>
              </div>
              
              {canEditOrder(detail.technicianId) && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {detail.technicalReport ? 'Editar informe técnico' : 'Agregar informe técnico'}
                </button>
              )}
            </section>

            {/* Costos y Repuestos (employee) */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
              <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Costos y Repuestos</h2>
            <div className="flex-1 flex flex-col gap-3">
              
              {/* Costo de Servicio */}
              <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Costo de Servicio / Mano de Obra</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Costo del trabajo de reparación</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${(detail.laborCost || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setShowLaborCostModal(true)}
                      className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>

              {/* Repuestos */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repuestos / Materiales</h3>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {(!detail.parts || detail.parts.length === 0) && <p className="text-sm text-gray-500 dark:text-gray-400">Sin repuestos</p>}
                  {detail.parts?.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 pb-2 dark:border-gray-700">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{p.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.qty} x ${p.unitPrice.toFixed(2)}</p>
                          {p.user && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">• {p.user.username}</span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">${p.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <span>Subtotal Repuestos</span>
                  <span>${partsTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Total General */}
              <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <span>TOTAL</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {canEditOrder(detail.technicianId) && (
              <button
                onClick={() => setShowPartModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                Agregar repuesto
              </button>
            )}
            </section>
          </div>
        )}

        {/* Historial y Repuestos (solo admin) */}
        {isAdmin && (
          <div className="grid md:grid-cols-2 gap-3 print:hidden">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
              <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Historial y Bitácora</h2>
              <div className="space-y-2 overflow-y-auto mb-3 flex-1">
                {(!detail.history || detail.history.length === 0) && <p className="text-sm text-gray-500 dark:text-gray-400">Sin registros</p>}
                {detail.history?.map((h) => (
                  <div key={h.id} className="rounded border border-gray-100 p-2 text-sm dark:border-gray-700">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(h.createdAt)}</p>
                      {h.user && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {h.getUserDisplayName()}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {h.statusTo ? getStatusLabel(h.statusTo) : "Nota"}
                    </p>
                    {h.note && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{h.note}</p>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowNoteModal(true)}
                className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Agregar bitácora
              </button>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
              <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Costos y Repuestos</h2>
              <div className="flex-1 flex flex-col gap-3">
                
                {/* Costo de Servicio */}
                <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Costo de Servicio / Mano de Obra</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Costo del trabajo de reparación</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${(detail.laborCost || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => setShowLaborCostModal(true)}
                        className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Repuestos */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repuestos / Materiales</h3>
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {(!detail.parts || detail.parts.length === 0) && <p className="text-sm text-gray-500 dark:text-gray-400">Sin repuestos</p>}
                    {detail.parts?.map((p) => (
                      <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 pb-2 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{p.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{p.qty} x ${p.unitPrice.toFixed(2)}</p>
                            {p.user && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">• {p.user.username}</span>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">${p.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <span>Subtotal Repuestos</span>
                    <span>${partsTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total General */}
                <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <span>TOTAL</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {canEditOrder(detail.technicianId) && (
                <button
                  onClick={() => setShowPartModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
                >
                  Agregar repuesto
                </button>
              )}
            </section>
          </div>
        )}

        {/* Modales */}
        {showReportModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Editar informe técnico</h3>
              <textarea
                className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              rows={6}
              value={report}
              onChange={(e) => setReport(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateReport}
                disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

        {isAdmin && showNoteModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Agregar bitácora</h3>
              <textarea
                className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                rows={4}
                placeholder="Nota"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddHistory}
                  disabled={saving || !note.trim()}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showPartModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Agregar repuesto</h3>
              <div className="space-y-2">
                <input
                  className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Descripción"
                  value={part.description}
                  onChange={(e) => setPart((prev) => ({ ...prev, description: e.target.value }))}
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
                      onChange={(e) => setPart((prev) => ({ ...prev, qty: Number(e.target.value) }))}
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
                      onChange={(e) => setPart((prev) => ({ ...prev, unit_price: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPart}
                  disabled={saving || !part.description.trim()}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showTechnicianModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Asignar Técnico</h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Selecciona un técnico</label>
                <select
                  className="w-full rounded border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
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
                <button
                  onClick={() => {
                    setShowTechnicianModal(false);
                    setSelectedTechnician("");
                  }}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignTechnician}
                  disabled={saving || !selectedTechnician}
                  className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        )}

        {showLaborCostModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Costo de Servicio / Mano de Obra</h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Ingrese el costo del servicio</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full rounded border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Este es el costo del trabajo de reparación, no incluye repuestos
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowLaborCostModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateLaborCost}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Factura */}
        {showInvoiceModal && detail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:block print:relative print:p-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl my-auto print:shadow-none print:max-w-none">
              <div className="p-6 border-b dark:border-gray-700 print:hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Vista Previa de Factura
                  </h2>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto print:p-0 print:max-h-none print:overflow-visible">
                <WorkOrderInvoice order={detail} />
              </div>

              <div className="p-6 border-t dark:border-gray-700 flex gap-3 justify-end print:hidden">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-medium inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir / Guardar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
