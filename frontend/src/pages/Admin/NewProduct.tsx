import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../../presentation/hooks/useClients";
import { useProducts } from "../../presentation/hooks/useProducts";
import type { Client } from "../../domain/entities/Client";
import type { Product } from "../../domain/entities/Product";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import flatpickr from "flatpickr";

export default function NewProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [clientForm, setClientForm] = useState({
    document_number: "",
    name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [formData, setFormData] = useState({
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
  const purchaseDateRef = useRef<HTMLInputElement | null>(null);
  const purchaseDatePicker = useRef<flatpickr.Instance | null>(null);

  // Hooks de la nueva arquitectura
  const { clients, loadClients, createClient } = useClients();
  const { products, loadProducts, createProduct } = useProducts();

  // Cargar datos iniciales
  useEffect(() => {
    loadClients();
    loadProducts();
  }, [loadClients, loadProducts]);

  // Cargar opciones de marcas desde productos existentes
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
        const matchingClients = clients.filter(client => 
          client.documentNumber && 
          client.documentNumber.toLowerCase().includes(docNumber.toLowerCase())
        );


        if (matchingClients.length === 1) {
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
        } else if (matchingClients.length > 1) {
          setClientSearchResults(matchingClients);
          setShowClientDropdown(true);
          setSelectedClient(null);
        } else {
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
        }
      } catch (err) {
        console.error("Error buscando clientes:", err);
        setClientSearchResults([]);
        setShowClientDropdown(false);
      } finally {
        setIsSearchingClient(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [clientForm.document_number]);

  // Búsqueda automática de producto con debounce
  useEffect(() => {
    const serialNumber = formData.serial_number.trim();
    
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
        const matchingProducts = products.filter(product => 
          product.serialNumber && 
          product.serialNumber.toLowerCase().includes(serialNumber.toLowerCase())
        );


        if (matchingProducts.length === 1) {
          const product = matchingProducts[0];
          setSelectedProduct(product);
          setFormData({
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
          setProductSearchResults(matchingProducts);
          setShowProductDropdown(true);
          setSelectedProduct(null);
        } else {
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
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [formData.serial_number]);

  // Inicializar flatpickr para fecha de compra
  useEffect(() => {
    if (!formData.warranty) {
      purchaseDatePicker.current?.destroy();
      purchaseDatePicker.current = null;
      return;
    }

    if (!purchaseDateRef.current) return;

    if (purchaseDatePicker.current) {
      purchaseDatePicker.current.setDate(formData.purchase_date ? formData.purchase_date : "", false);
      return;
    }

    purchaseDatePicker.current = flatpickr(purchaseDateRef.current, {
      dateFormat: "Y-m-d",
      defaultDate: formData.purchase_date || undefined,
      onChange: (_, dateStr) => {
        setFormData((prev) => ({ ...prev, purchase_date: dateStr }));
      },
    });

    return () => {
      purchaseDatePicker.current?.destroy();
      purchaseDatePicker.current = null;
    };
  }, [formData.warranty]);

  // Actualizar fecha en flatpickr cuando cambia formData.purchase_date
  useEffect(() => {
    if (purchaseDatePicker.current) {
      purchaseDatePicker.current.setDate(formData.purchase_date || "", false);
    } else if (purchaseDateRef.current) {
      purchaseDateRef.current.value = formData.purchase_date;
    }
  }, [formData.purchase_date]);

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
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === "brandSelection") {
      setFormData((prev) => ({
        ...prev,
        brandSelection: value,
        brandCustom: value === "__custom__" ? prev.brandCustom : "",
      }));
      return;
    }

    if (name === "guaranteeingBrandSelection") {
      setFormData((prev) => ({
        ...prev,
        guaranteeingBrandSelection: value,
        guaranteeingBrandCustom: value === "__custom__" ? prev.guaranteeingBrandCustom : "",
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validaciones básicas
    if (!clientForm.document_number.trim() || !clientForm.name.trim() || !clientForm.phone.trim()) {
      setError("Documento, nombre y teléfono del cliente son obligatorios");
      return;
    }
    const resolvedBrand =
      formData.brandSelection === "__custom__" ? formData.brandCustom.trim() : formData.brandSelection.trim();
    const resolvedGuaranteeBrand = formData.warranty
      ? formData.guaranteeingBrandSelection === "__custom__"
        ? formData.guaranteeingBrandCustom.trim()
        : formData.guaranteeingBrandSelection.trim()
      : "";

    if (!formData.item_type.trim() || !resolvedBrand || !formData.model.trim() || !formData.serial_number.trim()) {
      setError("Tipo de producto, marca, modelo y número de serie son obligatorios");
      return;
    }
    if (formData.warranty && (!resolvedGuaranteeBrand || !formData.purchase_date.trim())) {
      setError("Para productos con garantía, la marca garantizante y fecha de compra son obligatorias");
      return;
    }

    setIsSubmitting(true);
    try {
      let clientId: number;

      // Crear o actualizar cliente
      if (selectedClient) {
        const { clientRepository } = require("../../infrastructure/repositories/ClientRepository");
        const updated = await clientRepository.update(selectedClient.id, {
          document_number: clientForm.document_number.trim(),
          name: clientForm.name.trim(),
          phone: clientForm.phone.trim(),
          address: clientForm.address.trim() || undefined,
          email: clientForm.email.trim() || undefined,
        });
        clientId = updated.id;
      } else {
        const created = await createClient({
          document_number: clientForm.document_number.trim(),
          name: clientForm.name.trim(),
          phone: clientForm.phone.trim(),
          address: clientForm.address.trim() || undefined,
          email: clientForm.email.trim() || undefined,
        });
        clientId = created.id;
      }

      // Crear producto
      const resolvedBrand =
        formData.brandSelection === "__custom__" ? formData.brandCustom.trim() : formData.brandSelection.trim();
      const resolvedGuaranteeBrand = formData.warranty
        ? formData.guaranteeingBrandSelection === "__custom__"
          ? formData.guaranteeingBrandCustom.trim()
          : formData.guaranteeingBrandSelection.trim()
        : null;

      await createProduct({
        item_type: formData.item_type.trim(),
        brand: resolvedBrand,
        guaranteeing_brand: resolvedGuaranteeBrand,
        model: formData.model.trim(),
        serial_number: formData.serial_number.trim(),
        purchase_date: formData.warranty ? formData.purchase_date || null : null,
        warranty: formData.warranty,
        client_id: clientId,
      });
      navigate("/admin/products");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Error al crear el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Nuevo Producto" description="Registrar un nuevo producto en el inventario" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadCrumb pageTitle="Nuevo Producto" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Registrar Nuevo Producto
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Completa la información del producto
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos del Cliente */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Datos del Cliente *</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={clientForm.name}
                      onChange={handleClientChange}
                      placeholder="Nombre completo"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={clientForm.phone}
                      onChange={handleClientChange}
                      placeholder="Teléfono"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dirección
                    </label>
                    <input
                      name="address"
                      value={clientForm.address}
                      onChange={handleClientChange}
                      placeholder="Dirección"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={clientForm.email}
                      onChange={handleClientChange}
                      placeholder="correo@dominio.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Producto */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Datos del Producto *</h2>
              
              {/* Número de Serie */}
              <div className="mb-6 relative">
                <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  type="text"
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  onFocus={() => {
                    if (productSearchResults.length > 1) {
                      setShowProductDropdown(true);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ingrese número de serie del producto"
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

                {!selectedProduct && !showProductDropdown && formData.serial_number && !isSearchingProduct && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Producto no encontrado. Se creará uno nuevo.
                  </p>
                )}
              </div>

              {/* Tipo de Producto */}
              <div className="mb-6">
                <label htmlFor="item_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="item_type"
                  name="item_type"
                  value={formData.item_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: Laptop, Celular, Tablet"
                  disabled={!!selectedProduct}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Marca */}
                <div>
                  <label htmlFor="brandSelection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marca del Equipo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <select
                      id="brandSelection"
                      name="brandSelection"
                      value={formData.brandSelection}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {formData.brandSelection === "__custom__" && (
                      <input
                        type="text"
                        name="brandCustom"
                        value={formData.brandCustom}
                        onChange={handleChange}
                        placeholder="Ingrese marca"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!!selectedProduct}
                      />
                    )}
                  </div>
                </div>

                {/* Modelo */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ej: Pavilion, Galaxy S21"
                    disabled={!!selectedProduct}
                  />
                </div>
              </div>

              {/* Tipo de Garantía */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Tipo de Garantía</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <input
                      type="radio"
                      name="warranty"
                      checked={!formData.warranty}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          warranty: false,
                          guaranteeingBrandSelection: "",
                          guaranteeingBrandCustom: "",
                          purchase_date: "",
                        }))
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    Sin garantía
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <input
                      type="radio"
                      name="warranty"
                      checked={formData.warranty}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          warranty: true,
                        }))
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    Con garantía
                  </label>
                </div>
              </div>

              {/* Datos de Garantía */}
              {formData.warranty && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-200">Datos de garantía</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Marca Garantizante */}
                    <div>
                      <label htmlFor="guaranteeingBrandSelection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Marca Garantizante <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        <select
                          id="guaranteeingBrandSelection"
                          name="guaranteeingBrandSelection"
                          value={formData.guaranteeingBrandSelection}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Seleccione marca</option>
                          {guaranteeBrandOptions.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                          <option value="__custom__">Otra / Personalizada</option>
                        </select>
                        {formData.guaranteeingBrandSelection === "__custom__" && (
                          <input
                            type="text"
                            name="guaranteeingBrandCustom"
                            value={formData.guaranteeingBrandCustom}
                            onChange={handleChange}
                            placeholder="Ingrese marca que garantiza"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    </div>

                    {/* Fecha de Compra */}
                    <div>
                      <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha de Compra <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={purchaseDateRef}
                        type="text"
                        id="purchase_date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleChange}
                        placeholder="YYYY-MM-DD"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    "Guardar Producto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
