import { useState, useEffect, useRef } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    logout();
    closeDropdown();
    navigate("/"); // Volver a la página principal en lugar de signin
  }

  function handleGoAdmin() {
    closeDropdown();
    navigate("/admin"); // Ir al dashboard administrativo
  }

  // Mostrar loading state mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  // Si no hay usuario logueado, mostrar acceso para empleados/admin
  if (!user) {
    return (
      <Link
        to="/signin"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="hidden sm:inline">Empleados</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative flex-shrink-0">
          <img 
            src="/images/logo/user.png" 
            alt={user.username}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
            {user.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {user.role}
          </span>
        </div>
        <svg
          className={`hidden sm:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 overflow-hidden z-50 max-h-[calc(100vh-5rem)] overflow-y-auto"
      >
        {/* Header del dropdown con información del usuario */}
        <div className="px-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo/user.png" 
              alt={user.username}
              className="h-12 w-12 rounded-full object-cover border-2 border-white/50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-white/80 truncate">
                {user.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-white bg-white/20 rounded-full capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Opciones del menú */}
        <div className="py-2">
          <ul className="flex flex-col">
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                to="/admin/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </DropdownItem>
            </li>
            <li>
              <button
                onClick={handleGoAdmin}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </li>
            {user?.role === 'admin' && (
              <>
                <li>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    tag="a"
                    to="/admin/users"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Gestionar Usuarios
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    tag="a"
                    to="/admin/orders/new"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Orden
                  </DropdownItem>
                </li>
              </>
            )}
          </ul>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Toggle de tema */}
          <div className="px-4 py-2">
            <button
              onClick={() => {
                toggleTheme();
                closeDropdown();
              }}
              className="flex items-center justify-between w-full gap-3 px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                <span>Cambiar Tema</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {theme === 'dark' ? 'Oscuro' : 'Claro'}
              </span>
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Cerrar sesión */}
          <div className="px-4 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
