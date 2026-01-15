import { useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Dropdown } from "../components/ui/dropdown/Dropdown";

const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Nuestros Servicios", path: "/servicios" },
    { name: "Órdenes", path: "/ordenes" },
    { name: "Preguntas Frecuentes", path: "/faq" },
    { name: "Contacto", path: "/contacto" },
  ];

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40 dark:border-gray-700 dark:bg-gray-900 print:hidden shadow-sm">
      <div className="flex items-center justify-between w-full px-3 sm:px-4 py-3 sm:py-4 mx-auto max-w-7xl lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            className="h-8 sm:h-10 md:h-12 dark:hidden"
            src="/images/logo/techvel-logo.png"
            alt="Techvel Logo"
          />
          <img
            className="hidden h-8 sm:h-10 md:h-12 dark:block"
            src="/images/logo/techvel-logo-dark.png"
            alt="Techvel Logo"
          />
        </Link>

        {/* Desktop Navigation - Completamente oculto en móvil */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-colors ${
                  isActive
                    ? "active bg-indigo-100 border-b-2 border-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-400"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions - Completamente ocultos en móvil */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Ingresar
            </Link>
          ) : (
            <>
              <span className="text-gray-700 dark:text-gray-200 font-medium">{user?.username}</span>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          )}
          <ThemeToggleButton />
        </div>

        {/* Mobile menu button - Dropdown */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            data-menu-toggle
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-9 h-9 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Dropdown
            isOpen={isMobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            className="right-0 mt-2 w-64 md:hidden shadow-xl"
          >
            <nav className="py-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400"
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-indigo-400"
                    }`
                  }
                >
                  <span className="flex-1">{link.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400 rotate-90 opacity-100' : 'text-gray-400 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </NavLink>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              
              {/* Theme Toggle en móvil */}
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
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

              {/* Ingresar/Cerrar sesión en móvil */}
              {!isLoggedIn ? (
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mx-4 px-4 py-3 mt-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Ingresar
                </Link>
              ) : (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <div className="px-4 py-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Usuario</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 mx-4 px-4 py-3 mt-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </>
              )}
            </nav>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
