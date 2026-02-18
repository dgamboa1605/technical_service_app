import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useWorkOrders } from "../../presentation/hooks/useWorkOrders";
import type { WorkOrder } from "../../domain/entities/WorkOrder";
import WorkOrderInvoice from "../../components/work-order/WorkOrderInvoice";

export default function WorkOrderInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { getWorkOrderById } = useWorkOrders();
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        const data = await getWorkOrderById(Number(id));
        if (data) {
          setOrder(data);
          // Auto-print after loading
          setTimeout(() => {
            window.print();
          }, 500);
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
    loadOrder();
  }, [id, getWorkOrderById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando factura...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error || "Orden no encontrada"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0 print:bg-white">
      <WorkOrderInvoice order={order} />
      
      {/* Print buttons - hidden when printing */}
      <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Imprimir / Guardar PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
