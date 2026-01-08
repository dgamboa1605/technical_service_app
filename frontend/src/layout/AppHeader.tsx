import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";

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
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:border-gray-700 dark:bg-gray-900 print:hidden shadow-sm">
      <div className="flex items-center justify-between w-full px-4 py-4 mx-auto max-w-7xl lg:px-6">
        {/* Botón para ocultar/expandir sidebar (solo admin) */}
        {/* Botón para ocultar/expandir sidebar eliminado, ahora el logo controla el sidebar */}
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            className="h-12 dark:hidden"
            src="/images/logo/techvel-logo.png"
            alt="Techvel Logo"
          />
          <img
            className="hidden h-12 dark:block"
            src="/images/logo/techvel-logo-dark.png"
            alt="Techvel Logo"
          />
        </div>

        {/* Desktop Navigation o usuario logeado */}
        {location.pathname.startsWith('/admin') && isLoggedIn && user ? (
          <div className="flex items-center gap-4">
            <UserDropdown />
          </div>
        ) : (
          <>
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
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Ingresar
              </Link>
            </div>
          </>
        )}
        {/* Mobile menu button solo en admin */}
        {location.pathname.startsWith('/admin') && isLoggedIn && user && (
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle Sidebar"
            style={{ marginLeft: '0.5rem' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Navigation solo en público */}
      {!location.pathname.startsWith('/admin') && isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? "active bg-indigo-100 border-b-2 border-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-400"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 mt-2 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Ingresar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
