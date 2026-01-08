import { useEffect, useRef, useState, useMemo } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { useNavigate } from "react-router";
import { useClients } from "../../presentation/hooks/useClients";
import { useProducts } from "../../presentation/hooks/useProducts";
import { CreateWorkOrderUseCase } from "../../application/use-cases/work-orders/CreateWorkOrderUseCase";
import { workOrderRepository } from "../../infrastructure/repositories/WorkOrderRepository";
import { clientRepository } from "../../infrastructure/repositories/ClientRepository";
import type { Client } from "../../domain/entities/Client";
import type { Product } from "../../domain/entities/Product";
import type { ServiceType } from "../../domain/value-objects/ServiceType";
import flatpickr from "flatpickr";

interface ClientForm {
  document_number: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface ProductForm {
  item_type: string;
  brandSelection: string;
  brandCustom: string;
  guaranteeingBrandSelection: string;
  guaranteeingBrandCustom: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  warranty: boolean;
}

interface WorkOrderForm {
  service_type: ServiceType;
  customer_instructions: string;
  item_condition: string;
  delivered_accessories: string;
  observations: string;
}

export default function NewWorkOrder() {
  const navigate = useNavigate();

  const [serviceNumber, setServiceNumber] = useState<number | null>(null);
  const [headerDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const purchaseDateRef = useRef<HTMLInputElement | null>(null);
  const purchaseDatePicker = useRef<flatpickr.Instance | null>(null);

  const [clientForm, setClientForm] = useState<ClientForm>({
    document_number: "",
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  const [productForm, setProductForm] = useState<ProductForm>({
    item_type: "",
    brandSelection: "",
    brandCustom: "",
    guaranteeingBrandSelection: "",
    guaranteeingBrandCustom: "",
    model: "",
    serial_number: "",
    purchase_date: "",
      warranty: false,
  });

  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [guaranteeBrandOptions, setGuaranteeBrandOptions] = useState<string[]>([]);

  const [workOrderForm, setWorkOrderForm] = useState<WorkOrderForm>({
    service_type: "taller",
    customer_instructions: "",
    item_condition: "",
    delivered_accessories: "",
    observations: "",
  });

  // Hooks de la nueva arquitectura
  const { clients, loadClients, createClient } = useClients();
  const { products, loadProducts, createProduct } = useProducts();
  const createWorkOrderUseCase = useMemo(
    () => new CreateWorkOrderUseCase(workOrderRepository),
    []
  );

  useEffect(() => {
    const loadServiceNumber = async () => {
      try {
        const nextNumber = await workOrderRepository.getNextNumber();
        setServiceNumber(nextNumber);
      } catch (err) {
        console.error("Error obteniendo correlativo", err);
        setServiceNumber(null);
      }
    };

    loadServiceNumber();
    loadClients();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar opciones de marcas desde productos
  useEffect(() => {
    if (products.length > 0) {
      const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
      setBrandOptions(unique(products.map((p) => p.brand)));
      setGuaranteeBrandOptions(unique(products.map((p) => p.guaranteeingBrand || "")));
    }
  }, [products]);

  // Búsqueda automática de cliente con debounce
  useEffect(() => {
    const docNumber = clientForm.document_number.trim();
    
    if (!docNumber) {
      setSelectedClient(null);
      setIsSearchingClient(false);
      setClientSearchResults([]);
      setShowClientDropdown(false);
      return;
    }

    setIsSearchingClient(true);
    
    const timeoutId = setTimeout(() => {
      try {
        // Filtrar clientes cargados por coincidencia
        const matchingClients = clients.filter(client => 
          client.documentNumber && 
          client.documentNumber.toLowerCase().includes(docNumber.toLowerCase())
        );

        console.log('Clientes encontrados:', matchingClients.length, 'para búsqueda:', docNumber);

        if (matchingClients.length === 1) {
          // Si solo hay 1 coincidencia, seleccionarlo automáticamente
          const client = matchingClients[0];
          setSelectedClient(client);
          setClientForm({
            document_number: client.documentNumber || "",
            name: client.name || "",
            phone: client.phone || "",
            address: client.address || "",
            email: client.email || "",
          });
          setClientSearchResults([]);
          setShowClientDropdown(false);
          setSelectedProduct(null);
          setProductForm({
            item_type: "",
            brandSelection: "",
            brandCustom: "",
            guaranteeingBrandSelection: "",
            guaranteeingBrandCustom: "",
            model: "",
            serial_number: "",
            purchase_date: "",
            warranty: false,
          });
        } else if (matchingClients.length > 1) {
          // Si hay múltiples coincidencias, mostrar lista
          setClientSearchResults(matchingClients);
          setShowClientDropdown(true);
          setSelectedClient(null);
        } else {
          // No se encontró ningún cliente
          setSelectedClient(null);
          setClientSearchResults([]);
          setShowClientDropdown(false);
          setClientForm((prev) => ({
            ...prev,
            name: "",
            phone: "",
            address: "",
            email: "",
          }));
          setSelectedProduct(null);
          setProductForm({
            item_type: "",
            brandSelection: "",
            brandCustom: "",
            guaranteeingBrandSelection: "",
            guaranteeingBrandCustom: "",
            model: "",
            serial_number: "",
            purchase_date: "",
            warranty: false,
          });
        }
      } catch (err) {
        console.error("Error buscando clientes:", err);
        setClientSearchResults([]);
        setShowClientDropdown(false);
      } finally {
        setIsSearchingClient(false);
      }
    }, 600); // Espera 600ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [clientForm.document_number]);

  // Búsqueda automática de producto con debounce
  useEffect(() => {
    const serialNumber = productForm.serial_number.trim();
    
    if (!serialNumber) {
      setSelectedProduct(null);
      setIsSearchingProduct(false);
      setProductSearchResults([]);
      setShowProductDropdown(false);
      return;
    }

    setIsSearchingProduct(true);
    
    const timeoutId = setTimeout(() => {
      try {
        // Filtrar productos cargados por número de serie
        const matchingProducts = products.filter(product => 
          product.serialNumber && 
          product.serialNumber.toLowerCase().includes(serialNumber.toLowerCase())
        );

        console.log('Productos encontrados:', matchingProducts.length, 'para búsqueda:', serialNumber);

        if (matchingProducts.length === 1) {
          // Si solo hay 1 coincidencia, seleccionarlo automáticamente
          const product = matchingProducts[0];
          setSelectedProduct(product);
          setProductForm({
            item_type: product.itemType || "",
            brandSelection: product.brand || "",
            brandCustom: "",
            guaranteeingBrandSelection: product.guaranteeingBrand || "",
            guaranteeingBrandCustom: "",
            model: product.model || "",
            serial_number: product.serialNumber || "",
            purchase_date: product.purchaseDate || "",
            warranty: product.warranty || false,
          });
          setProductSearchResults([]);
          setShowProductDropdown(false);
        } else if (matchingProducts.length > 1) {
          // Si hay múltiples coincidencias, mostrar lista
          setProductSearchResults(matchingProducts);
          setShowProductDropdown(true);
          setSelectedProduct(null);
        } else {
          // No se encontró ningún producto
          setSelectedProduct(null);
          setProductSearchResults([]);
          setShowProductDropdown(false);
        }
      } catch (err) {
        console.error("Error buscando productos:", err);
        setProductSearchResults([]);
        setShowProductDropdown(false);
      } finally {
        setIsSearchingProduct(false);
      }
    }, 600); // Espera 600ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [productForm.serial_number]);

  useEffect(() => {
    if (!productForm.warranty) {
      purchaseDatePicker.current?.destroy();
      purchaseDatePicker.current = null;
      return;
    }

    if (!purchaseDateRef.current) return;

    if (purchaseDatePicker.current) {
      purchaseDatePicker.current.setDate(productForm.purchase_date ? productForm.purchase_date : "", false);
      return;
    }

    purchaseDatePicker.current = flatpickr(purchaseDateRef.current, {
      dateFormat: "Y-m-d",
      defaultDate: productForm.purchase_date || undefined,
      onChange: (_, dateStr) => {
        setProductForm((prev) => ({ ...prev, purchase_date: dateStr }));
      },
    });

    return () => {
      purchaseDatePicker.current?.destroy();
      purchaseDatePicker.current = null;
    };
  }, [productForm.warranty]);

  useEffect(() => {
    if (purchaseDatePicker.current) {
      purchaseDatePicker.current.setDate(productForm.purchase_date || "", false);
    } else if (purchaseDateRef.current) {
      purchaseDateRef.current.value = productForm.purchase_date;
    }
  }, [productForm.purchase_date]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientForm({
      document_number: client.documentNumber || "",
      name: client.name || "",
      phone: client.phone || "",
      address: client.address || "",
      email: client.email || "",
    });
    setClientSearchResults([]);
    setShowClientDropdown(false);
    setSelectedProduct(null);
    setProductForm({
      item_type: "",
      brandSelection: "",
      brandCustom: "",
      guaranteeingBrandSelection: "",
      guaranteeingBrandCustom: "",
      model: "",
      serial_number: "",
      purchase_date: "",
      warranty: false,
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      item_type: product.itemType || "",
      brandSelection: product.brand || "",
      brandCustom: "",
      guaranteeingBrandSelection: product.guaranteeingBrand || "",
      guaranteeingBrandCustom: "",
      model: product.model || "",
      serial_number: product.serialNumber || "",
      purchase_date: product.purchaseDate || "",
      warranty: product.warranty || false,
    });
    setProductSearchResults([]);
    setShowProductDropdown(false);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" && (e.target as HTMLInputElement).checked;

    if (name === "brandSelection") {
      setProductForm((prev) => ({
        ...prev,
        brandSelection: value,
        brandCustom: value === "__custom__" ? prev.brandCustom : "",
      }));
      return;
    }

    if (name === "guaranteeingBrandSelection") {
      setProductForm((prev) => ({
        ...prev,
        guaranteeingBrandSelection: value,
        guaranteeingBrandCustom: value === "__custom__" ? prev.guaranteeingBrandCustom : "",
      }));
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkOrderForm((prev) => ({ ...prev, [name]: value }));
  };



  const resetForms = () => {
    setSelectedClient(null);
    setSelectedProduct(null);
    setClientForm({ document_number: "", name: "", phone: "", address: "", email: "" });
    setProductForm({
      item_type: "",
      brandSelection: "",
      brandCustom: "",
      guaranteeingBrandSelection: "",
      guaranteeingBrandCustom: "",
      model: "",
      serial_number: "",
      purchase_date: "",
      warranty: false,
    });
    setWorkOrderForm({
      service_type: "taller",
      customer_instructions: "",
      item_condition: "",
      delivered_accessories: "",
      observations: "",
    });
  };

  const ensureRequiredFields = () => {
    if (!clientForm.document_number.trim() || !clientForm.name.trim() || !clientForm.phone.trim()) {
      setError("Documento, nombre y teléfono del cliente son obligatorios");
      return false;
    }

    // Si hay un producto seleccionado, no necesitamos validar el formulario de producto
    if (selectedProduct) {
      return true;
    }

    // Validación del formulario de producto solo si estamos creando uno nuevo
    const resolvedBrand =
      productForm.brandSelection === "__custom__" ? productForm.brandCustom.trim() : productForm.brandSelection.trim();
    const resolvedGuaranteeBrand = productForm.warranty
      ? productForm.guaranteeingBrandSelection === "__custom__"
        ? productForm.guaranteeingBrandCustom.trim()
        : productForm.guaranteeingBrandSelection.trim()
      : "";

    if (!resolvedBrand || !productForm.model.trim() || !productForm.serial_number.trim()) {
      setError("Complete marca, modelo y serie del producto");
      return false;
    }

    if (productForm.warranty && !productForm.item_type.trim()) {
      setError("Para equipos en garantía indique el artículo");
      return false;
    }

    if (productForm.warranty && (!resolvedGuaranteeBrand || !productForm.purchase_date.trim())) {
      setError("Para equipos en garantía indique la marca que garantiza y la fecha de compra");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!ensureRequiredFields()) {
      setIsLoading(false);
      return;
    }

    try {
      let clientId: number;
      let productId: number;

      if (selectedClient) {
        // Actualizar cliente existente
        const updated = await clientRepository.update(selectedClient.id, {
          document_number: clientForm.document_number.trim(),
          name: clientForm.name.trim(),
          phone: clientForm.phone.trim(),
          address: clientForm.address.trim() || undefined,
          email: clientForm.email.trim() || undefined,
        });
        clientId = updated.id;
      } else {
        // Crear nuevo cliente usando el hook
        const created = await createClient({
          document_number: clientForm.document_number.trim(),
          name: clientForm.name.trim(),
          phone: clientForm.phone.trim(),
          address: clientForm.address.trim() || undefined,
          email: clientForm.email.trim() || undefined,
        });
        clientId = created.id;
      }

      if (selectedProduct) {
        productId = selectedProduct.id;
      } else {
        const resolvedBrand =
          productForm.brandSelection === "__custom__" ? productForm.brandCustom.trim() : productForm.brandSelection.trim();
        const resolvedGuaranteeBrand = productForm.warranty
          ? productForm.guaranteeingBrandSelection === "__custom__"
            ? productForm.guaranteeingBrandCustom.trim()
            : productForm.guaranteeingBrandSelection.trim()
          : null;

        // Crear nuevo producto usando el hook
        const product = await createProduct({
          item_type: productForm.item_type.trim() || "N/A",
          brand: resolvedBrand,
          guaranteeing_brand: productForm.warranty ? resolvedGuaranteeBrand || null : null,
          model: productForm.model.trim(),
          serial_number: productForm.serial_number.trim(),
          purchase_date: productForm.warranty ? productForm.purchase_date || null : null,
          warranty: productForm.warranty,
          client_id: clientId,
        });
        productId = product.id;
      }

      // Crear orden de trabajo usando el caso de uso
      await createWorkOrderUseCase.execute({
        client_id: clientId,
        product_id: productId,
        technician_id: null,
        assigned_date: null,
        status: "recibido",  // Estado inicial: Recibido en recepción
        service_type: workOrderForm.service_type,
        customer_instructions: workOrderForm.customer_instructions.trim() || null,
        item_condition: workOrderForm.item_condition.trim() || null,
        delivered_accessories: workOrderForm.delivered_accessories.trim() || null,
        observations: workOrderForm.observations.trim() || null,
      });

      setSuccess("Orden registrada correctamente");
      resetForms();
      const nextNumber = await workOrderRepository.getNextNumber();
      setServiceNumber(nextNumber);

      setTimeout(() => navigate("/admin/orders"), 1200);
    } catch (err) {
      console.error("Error al registrar orden", err);
      setError("No se pudo registrar la orden. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBreadCrumb pageTitle="Nueva Orden de Trabajo" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">REGISTRO DE NUEVA ORDEN</h1>
        </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Nro de Servicio</label>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-lg font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                {serviceNumber ?? "Autogenerado"}
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">solo lectura</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Fecha</label>
              <input
                type="date"
                value={headerDate}
                readOnly
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tipo de Servicio *</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["taller", "recojo", "domicilio", "instalacion"].map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${
                  workOrderForm.service_type === type
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="service_type"
                  value={type}
                  checked={workOrderForm.service_type === type}
                  onChange={handleWorkOrderChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                {type}
              </label>
            ))}
          </div>
        </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Datos Cliente *</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nro. Documento <span className="text-red-500">*</span>
                    {isSearchingClient && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">Buscando...</span>
                    )}
                    {selectedClient && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Cliente encontrado</span>
                    )}
                    {clientSearchResults.length > 1 && (
                      <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                        {clientSearchResults.length} clientes encontrados
                      </span>
                    )}
                  </label>
                  <input
                    name="document_number"
                    value={clientForm.document_number}
                    onChange={handleClientChange}
                    onFocus={() => {
                      if (clientSearchResults.length > 1) {
                        setShowClientDropdown(true);
                      }
                    }}
                    placeholder="Ingrese nro. de documento"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    autoComplete="off"
                  />
                  
                  {/* Dropdown de resultados */}
                  {showClientDropdown && clientSearchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-60 overflow-y-auto">
                      {clientSearchResults.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {client.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Doc: {client.documentNumber}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Tel: {client.phone}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!selectedClient && !showClientDropdown && clientForm.document_number && !isSearchingClient && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Cliente no encontrado. Complete los datos para crear uno nuevo.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre <span className="text-red-500">*</span></label>
                  <input
                    name="name"
                    value={clientForm.name}
                    onChange={handleClientChange}
                    placeholder="Nombre completo"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono <span className="text-red-500">*</span></label>
                  <input
                    name="phone"
                    value={clientForm.phone}
                    onChange={handleClientChange}
                    placeholder="Teléfono"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                  <input
                    name="address"
                    value={clientForm.address}
                    onChange={handleClientChange}
                    placeholder="Dirección"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={clientForm.email}
                    onChange={handleClientChange}
                    placeholder="correo@dominio.com"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Datos Producto *</h2>

          {/* Búsqueda por Número de Serie */}
          <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Número de Serie <span className="text-red-500">*</span>
                {isSearchingProduct && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">Buscando...</span>
                )}
                {selectedProduct && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Producto encontrado</span>
                )}
                {productSearchResults.length > 1 && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                    {productSearchResults.length} productos encontrados
                  </span>
                )}
              </label>
              <input
                name="serial_number"
                value={productForm.serial_number}
                onChange={handleProductChange}
                onFocus={() => {
                  if (productSearchResults.length > 1) {
                    setShowProductDropdown(true);
                  }
                }}
                placeholder="Ingrese número de serie del producto"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                autoComplete="off"
              />
              
              {/* Dropdown de resultados de productos */}
              {showProductDropdown && productSearchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-60 overflow-y-auto">
                  {productSearchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.brand} - {product.model}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Serie: {product.serialNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {product.warranty ? '✓ Con garantía' : 'Sin garantía'}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!selectedProduct && !showProductDropdown && productForm.serial_number && !isSearchingProduct && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Producto no encontrado. Complete los datos para crear uno nuevo.
                </p>
              )}
            </div>

            {/* Tipo de Producto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Producto</label>
              <input
                name="item_type"
                value={productForm.item_type}
                onChange={handleProductChange}
                placeholder="Ej: Laptop, Impresora, Televisor"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
                disabled={!!selectedProduct}
              />
            </div>

            {/* Marca del Equipo y Modelo */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca del Equipo <span className="text-red-500">*</span></label>
                <div className="mt-2 flex flex-col gap-2">
                  <select
                    name="brandSelection"
                    value={productForm.brandSelection}
                    onChange={handleProductChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
                    disabled={!!selectedProduct}
                  >
                    <option value="">Seleccione marca</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                    <option value="__custom__">Otra / Personalizada</option>
                  </select>
                  {productForm.brandSelection === "__custom__" && (
                    <input
                      name="brandCustom"
                      value={productForm.brandCustom}
                      onChange={handleProductChange}
                      placeholder="Ingrese marca"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
                      disabled={!!selectedProduct}
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo <span className="text-red-500">*</span></label>
                <input
                  name="model"
                  value={productForm.model}
                  onChange={handleProductChange}
                  placeholder="Modelo"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  disabled={!!selectedProduct}
                />
              </div>
            </div>

            {/* Tipo de Garantía */}
            <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tipo de Garantía</span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="warranty"
                    checked={!productForm.warranty}
                    onChange={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        warranty: false,
                        guaranteeingBrandSelection: "",
                        guaranteeingBrandCustom: "",
                        purchase_date: "",
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  Sin garantía
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="warranty"
                    checked={productForm.warranty}
                    onChange={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        warranty: true,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  Con garantía
                </label>
              </div>
            </div>

            {/* Datos de Garantía */}
            {productForm.warranty && (
              <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-900/10">
                <p className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-200">Datos de garantía</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Artículo</label>
                    <input
                      name="item_type"
                      value={productForm.item_type}
                      onChange={handleProductChange}
                      placeholder="Ej: Laptop"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca que Garantiza</label>
                    <div className="mt-2 flex flex-col gap-2">
                      <select
                        name="guaranteeingBrandSelection"
                        value={productForm.guaranteeingBrandSelection}
                        onChange={handleProductChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Seleccione marca</option>
                        {guaranteeBrandOptions.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="__custom__">Otra / Personalizada</option>
                      </select>
                      {productForm.guaranteeingBrandSelection === "__custom__" && (
                        <input
                          name="guaranteeingBrandCustom"
                          value={productForm.guaranteeingBrandCustom}
                          onChange={handleProductChange}
                          placeholder="Ingrese marca que garantiza"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Compra</label>
                    <input
                      ref={purchaseDateRef}
                      type="text"
                      name="purchase_date"
                      value={productForm.purchase_date}
                      onChange={handleProductChange}
                      placeholder="YYYY-MM-DD"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Detalle y observaciones</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Indicaciones del Cliente</label>
              <textarea
                name="customer_instructions"
                value={workOrderForm.customer_instructions}
                onChange={handleWorkOrderChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado del Artículo</label>
              <textarea
                name="item_condition"
                value={workOrderForm.item_condition}
                onChange={handleWorkOrderChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Accesorios Entregados</label>
              <textarea
                name="delivered_accessories"
                value={workOrderForm.delivered_accessories}
                onChange={handleWorkOrderChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
              <textarea
                name="observations"
                value={workOrderForm.observations}
                onChange={handleWorkOrderChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading && (
              <svg className="-ml-1 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Registrar
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
