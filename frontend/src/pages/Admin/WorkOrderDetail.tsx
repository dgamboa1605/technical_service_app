import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import WorkOrderInvoice from "../../components/work-order/WorkOrderInvoice";
import { useAuthorization } from "../../presentation/hooks/useAuthorization";
import { useWorkOrderDetail } from "../../presentation/hooks/useWorkOrderDetail";
import {
  WorkOrderHeaderSection,
  WorkOrderProductSection,
  WorkOrderClientSection,
  WorkOrderReceptionInfoSection,
  WorkOrderTechnicalReportSection,
  WorkOrderCostsAndPartsSection,
  WorkOrderHistorySection,
  ReportModal,
  NoteModal,
  PartModal,
  TechnicianModal,
  LaborCostModal,
} from "../../components/work-order/detail";

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, canEditOrder } = useAuthorization();
  const {
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
  } = useWorkOrderDetail(id);

  const handleUpdateLaborCostWithCheck = () => {
    handleUpdateLaborCost(() => isAdmin || canEditOrder(detail!.technicianId));
  };

  if (!id) {
    return (
      <>
        <PageMeta title="Detalle de Orden | Sistema de Servicio Técnico" description="Detalle de la orden de trabajo" />
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
        <PageMeta title="Detalle de Orden | Sistema de Servicio Técnico" description="Detalle de la orden de trabajo" />
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
        <PageMeta title="Detalle de Orden | Sistema de Servicio Técnico" description="Detalle de la orden de trabajo" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle="Detalle de Orden" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <p className="text-red-600">{error}</p>
          <div className="flex gap-3">
            <button onClick={loadDetail} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Reintentar
            </button>
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
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
        <PageMeta title={`Orden #${detail.id} | Sistema de Servicio Técnico`} description="Detalle de la orden de trabajo" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle={`Orden de Trabajo #${detail.id}`} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <WorkOrderHeaderSection
          order={detail}
          nextStatuses={nextStatuses}
          saving={saving}
          isAdmin={isAdmin}
          onAdvanceStatus={handleAdvanceStatus}
          onOpenInvoice={() => setShowInvoiceModal(true)}
          onOpenTechnicianModal={() => setShowTechnicianModal(true)}
          onOpenReportModal={() => setShowReportModal(true)}
        />

        <div className="grid md:grid-cols-2 gap-3 print:hidden">
          <WorkOrderProductSection order={detail} />
          {isAdmin ? (
            <WorkOrderClientSection order={detail} />
          ) : (
            <WorkOrderReceptionInfoSection order={detail} />
          )}
        </div>

        {isAdmin && (
          <div className="grid md:grid-cols-2 gap-3 print:hidden">
            <WorkOrderReceptionInfoSection order={detail} />
            <WorkOrderTechnicalReportSection
              order={detail}
              canEdit={true}
              onEditReport={() => setShowReportModal(true)}
            />
          </div>
        )}

        {!isAdmin && (
          <div className="grid md:grid-cols-2 gap-3 print:hidden">
            <WorkOrderTechnicalReportSection
              order={detail}
              canEdit={canEditOrder(detail.technicianId)}
              onEditReport={() => setShowReportModal(true)}
            />
            <WorkOrderCostsAndPartsSection
              order={detail}
              partsTotal={partsTotal}
              grandTotal={grandTotal}
              canEdit={canEditOrder(detail.technicianId)}
              onEditLaborCost={() => setShowLaborCostModal(true)}
              onAddPart={() => setShowPartModal(true)}
            />
          </div>
        )}

        {isAdmin && (
          <div className="grid md:grid-cols-2 gap-3 print:hidden">
            <WorkOrderHistorySection order={detail} onAddNote={() => setShowNoteModal(true)} />
            <WorkOrderCostsAndPartsSection
              order={detail}
              partsTotal={partsTotal}
              grandTotal={grandTotal}
              canEdit={canEditOrder(detail.technicianId)}
              onEditLaborCost={() => setShowLaborCostModal(true)}
              onAddPart={() => setShowPartModal(true)}
            />
          </div>
        )}

        <div className="print:hidden">
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            value={report}
            onChange={setReport}
            onSave={handleUpdateReport}
            saving={saving}
          />
          {isAdmin && (
            <NoteModal
              isOpen={showNoteModal}
              onClose={() => setShowNoteModal(false)}
              value={note}
              onChange={setNote}
              onAdd={handleAddHistory}
              saving={saving}
            />
          )}
          <PartModal
            isOpen={showPartModal}
            onClose={() => setShowPartModal(false)}
            part={part}
            onPartChange={setPart}
            onAdd={handleAddPart}
            saving={saving}
          />
          <TechnicianModal
            isOpen={showTechnicianModal}
            onClose={() => {
              setShowTechnicianModal(false);
              setSelectedTechnician("");
            }}
            technicians={technicians}
            selectedId={selectedTechnician}
            onSelect={setSelectedTechnician}
            onAssign={handleAssignTechnician}
            saving={saving}
          />
          <LaborCostModal
            isOpen={showLaborCostModal}
            onClose={() => setShowLaborCostModal(false)}
            value={laborCost}
            onChange={setLaborCost}
            onSave={handleUpdateLaborCostWithCheck}
            saving={saving}
          />
        </div>

        {showInvoiceModal && detail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:block print:relative print:p-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl my-auto print:shadow-none print:max-w-none">
              <div className="p-6 border-b dark:border-gray-700 print:hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vista Previa de Factura</h2>
                  <button type="button" onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-6 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200">
                  Cerrar
                </button>
                <button type="button" onClick={() => window.print()} className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-medium inline-flex items-center gap-2">
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
