import { useState } from "react";
import { Link, NavLink } from "react-router";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { useAuth } from "../context/AuthContext";

const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
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
        </Link>
        {/* Navegación */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-base font-medium transition-colors duration-200 px-1 ${
                  isActive
                    ? "text-primary-600 dark:text-gray-200 border-b-2 border-primary-600 dark:border-white"
                    : "text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 border-b-2 border-transparent"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
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
        {/* Menú móvil */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={toggleMobileMenu}
        >
          <span className="sr-only">Abrir menú</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                      : "text-gray-700 hover:bg-primary-50 dark:text-gray-200 dark:hover:bg-primary-800"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
