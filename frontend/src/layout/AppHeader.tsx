import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";
import { Dropdown } from "../components/ui/dropdown/Dropdown";

const AppHeader: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();
  const { toggleMobileSidebar } = useSidebar();

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
        <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>

        {/* Desktop Navigation o usuario logeado */}
        {location.pathname.startsWith('/admin') && isLoggedIn && user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <UserDropdown />
            {/* Mobile menu button para admin */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden flex items-center justify-center w-9 h-9 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Abrir menú"
              aria-expanded={false}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
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

            {/* Desktop Botón Ingresar - Completamente oculto en móvil */}
            <Link
              to="/signin"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Ingresar
            </Link>

            {/* Mobile menu button para público - Dropdown */}
            <div className="md:hidden relative">
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
                      <svg className={`w-4 h-4 transition-transform ${location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400 rotate-90' : 'text-gray-400 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </NavLink>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mx-4 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Ingresar
                  </Link>
                </nav>
              </Dropdown>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
