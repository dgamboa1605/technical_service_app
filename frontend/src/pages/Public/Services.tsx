import PageMeta from "../../components/common/PageMeta";

export default function Services() {
  return (
    <>
      <PageMeta title="Nuestros Servicios" description="Servicios de reparación y mantenimiento técnico" />
      <div className="max-w-6xl mx-auto">
        {/* Header de la página */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Nuestros Servicios
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ofrecemos una amplia gama de servicios técnicos especializados
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Servicio 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Reparación de Computadoras
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Diagnóstico y reparación de laptops, PCs de escritorio, problemas de hardware y software.
            </p>
          </div>

          {/* Servicio 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Reparación de Celulares
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Cambio de pantallas, baterías, reparación de software y actualización de sistemas.
            </p>
          </div>

          {/* Servicio 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Mantenimiento Preventivo
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Limpieza de equipos, cambio de pasta térmica, optimización de rendimiento.
            </p>
          </div>

          {/* Servicio 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Instalación de Software
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Instalación y configuración de sistemas operativos, programas especializados y drivers.
            </p>
          </div>

          {/* Servicio 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Recuperación de Datos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Recuperación de información de discos duros dañados, memorias USB y tarjetas SD.
            </p>
          </div>

          {/* Servicio 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Servicio de Garantía
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Atención especializada para equipos en garantía, reparaciones certificadas.
            </p>
          </div>
        </div>

        {/* Sección adicional */}
        <div className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¿No encuentras el servicio que necesitas?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Contáctanos y con gusto te atenderemos para resolver tu problema técnico
          </p>
          <a
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contáctanos
          </a>
        </div>
      </div>
    </>
  );
}
