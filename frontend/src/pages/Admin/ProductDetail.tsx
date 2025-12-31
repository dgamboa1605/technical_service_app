import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsApi, type Product } from "../../services/api";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item_type: "",
    brand: "",
    guaranteeing_brand: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    warranty: false,
    client_id: 0,
  });
  
  const purchaseDateRef = useRef<HTMLInputElement>(null);
  const purchaseDatePicker = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID de producto no válido');
      setIsLoading(false);
      return;
    }
    
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      setError('ID de producto no válido');
      setIsLoading(false);
      return;
    }
    
    loadProduct(productId);
  }, [id]);

  // Inicializar flatpickr cuando se active el modo de edición y warranty sea true
  useEffect(() => {
    if (!isEditing || !formData.warranty || !purchaseDateRef.current) {
      return;
    }

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
  }, [isEditing, formData.warranty]);

  // Actualizar fecha en flatpickr cuando cambia formData.purchase_date
  useEffect(() => {
    if (purchaseDatePicker.current) {
      purchaseDatePicker.current.setDate(formData.purchase_date || "", false);
    } else if (purchaseDateRef.current) {
      purchaseDateRef.current.value = formData.purchase_date;
    }
  }, [formData.purchase_date]);

  const loadProduct = async (productId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsApi.getById(productId);
      setProduct(data);
      setFormData({
        item_type: data.item_type || "",
        brand: data.brand || "",
        guaranteeing_brand: data.guaranteeing_brand || "",
        model: data.model || "",
        serial_number: data.serial_number || "",
        purchase_date: data.purchase_date || "",
        warranty: data.warranty || false,
        client_id: data.client_id || 0,
      });
    } catch (error: any) {
      const errorMsg = error.response?.status === 404 
        ? 'Producto no encontrado' 
        : 'Error al cargar el producto. Por favor intente nuevamente.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item_type.trim() || !formData.brand.trim() || !formData.model.trim() || !formData.serial_number.trim()) {
      setError('Por favor complete los campos obligatorios');
      return;
    }

    if (!product) return;

    setIsLoading(true);
    setError(null);
    try {
      const updateData = {
        item_type: formData.item_type.trim(),
        brand: formData.brand.trim(),
        guaranteeing_brand: formData.guaranteeing_brand.trim() || null,
        model: formData.model.trim(),
        serial_number: formData.serial_number.trim(),
        purchase_date: formData.purchase_date || null,
        warranty: formData.warranty,
        client_id: formData.client_id,
      };

      await productsApi.update(product.id, updateData);
      setIsEditing(false);
      loadProduct(product.id);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setIsLoading(true);
    setError(null);
    try {
      await productsApi.delete(product.id);
      navigate('/admin/products');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al eliminar el producto');
      setIsLoading(false);
    }
  };

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600 dark:text-gray-400">Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {error || 'Producto no encontrado'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              El producto solicitado no existe o ha ocurrido un error al cargarlo.
            </p>
            <button
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Producto: ${product.item_type} ${product.brand}`} description="Detalles del producto" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageBreadCrumb pageTitle="Detalle del Producto" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          
          {/* Header con acciones */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.item_type} {product.brand}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Producto #{product.id} - {product.model}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {!isEditing ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Tipo de Producto
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">{product.item_type}</div>
                    </div>
                  </div>

                  {/* Marca */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Marca
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">{product.brand}</div>
                    </div>
                  </div>

                  {/* Modelo */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Modelo
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">{product.model}</div>
                    </div>
                  </div>

                  {/* Número de Serie */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Número de Serie
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">{product.serial_number}</div>
                    </div>
                  </div>

                  {/* Marca Garantizante */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Marca Garantizante
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {product.guaranteeing_brand || <span className="text-gray-400 italic">No especificado</span>}
                      </div>
                    </div>
                  </div>

                  {/* Fecha de Compra */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Fecha de Compra
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {product.purchase_date ? new Date(product.purchase_date).toLocaleDateString('es-PE') : <span className="text-gray-400 italic">No especificada</span>}
                      </div>
                    </div>
                  </div>

                  {/* Garantía */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className={`p-3 rounded-lg ${product.warranty ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <svg className={`w-6 h-6 ${product.warranty ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={product.warranty ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Garantía
                      </label>
                      <div className={`text-base font-semibold ${product.warranty ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {product.warranty ? 'Con Garantía' : 'Sin Garantía'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Información
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Actualiza la información del producto
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="item_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="item_type"
                      value={formData.item_type}
                      onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ej: Laptop, Celular, Tablet"
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ej: HP, Samsung, Apple"
                    />
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Modelo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ej: Pavilion, Galaxy S21"
                    />
                  </div>

                  <div>
                    <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Serie <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="serial_number"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ej: SN123456789"
                    />
                  </div>
                </div>

                {/* Tipo de Garantía */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="warranty"
                      checked={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="warranty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Producto con garantía
                    </label>
                  </div>
                </div>

                {/* Datos de Garantía - Solo visible cuando warranty = true */}
                {formData.warranty && (
                  <div className="mt-6 mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-200">Datos de garantía</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Marca Garantizante */}
                      <div>
                        <label htmlFor="guaranteeing_brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Marca Garantizante
                        </label>
                        <input
                          type="text"
                          id="guaranteeing_brand"
                          value={formData.guaranteeing_brand}
                          onChange={(e) => setFormData({ ...formData, guaranteeing_brand: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Marca que garantiza"
                        />
                      </div>

                      {/* Fecha de Compra */}
                      <div>
                        <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fecha de Compra
                        </label>
                        <input
                          type="text"
                          id="purchase_date"
                          ref={purchaseDateRef}
                          placeholder="Seleccionar fecha"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (product) {
                        setFormData({
                          item_type: product.item_type || "",
                          brand: product.brand || "",
                          guaranteeing_brand: product.guaranteeing_brand || "",
                          model: product.model || "",
                          serial_number: product.serial_number || "",
                          purchase_date: product.purchase_date || "",
                          warranty: product.warranty || false,
                          client_id: product.client_id || 0,
                        });
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
