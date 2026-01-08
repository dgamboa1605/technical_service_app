import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useAuthorization } from "../presentation/hooks/useAuthorization";

// Icons for admin sidebar
const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; action?: () => void }[];
};

const AdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { isAdmin } = useAuthorization();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    item: string;
  } | null>(null);

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/admin",
      },
      {
        icon: <UserIcon />,
        name: "Mi Perfil",
        path: "/admin/profile",
      },
      {
        icon: <ClipboardIcon />,
        name: "Órdenes de Trabajo",
        subItems: [
          ...(isAdmin ? [{ name: "Nueva Orden", path: "/admin/orders/new" }] : []),
          { name: "Todas las Órdenes", path: "/admin/orders" },
          { name: "Pendientes", path: "/admin/orders?status=recibido,asignado,por_confirmar" },
          { name: "En Progreso", path: "/admin/orders?status=confirmado,en_reparacion" },
          { name: "Completadas", path: "/admin/orders?status=completado,entregado" },
        ],
      },
    ];

    // Solo agregar estas secciones si es admin
    if (isAdmin) {
      items.push(
        {
          icon: <UsersIcon />,
          name: "Clientes",
          subItems: [
            { name: "Nuevo Cliente", path: "/admin/clients/new" },
            { name: "Todos los Clientes", path: "/admin/clients" },
          ],
        },
        {
          icon: <BoxIcon />,
          name: "Inventario",
          subItems: [
            { name: "Nuevo Producto", path: "/admin/products/new" },
            { name: "Todos los Productos", path: "/admin/products" },
          ],
        },
        {
          icon: <UserIcon />,
          name: "Usuarios",
          subItems: [
            { name: "Nuevo Usuario", path: "/admin/users/new" },
            { name: "Todos los Usuarios", path: "/admin/users" },
          ],
        }
      );
    }

    return items;
  }, [isAdmin]);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSubmenu = (type: "main" | "others", item: string) => {
    if (openSubmenu?.type === type && openSubmenu?.item === item) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu({ type, item });
    }
  };

  const isSubmenuOpen = (type: "main" | "others", item: string) => {
    return openSubmenu?.type === type && openSubmenu?.item === item;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (subItems: { name: string; path: string }[] = []) => {
    return subItems.some(item => location.pathname === item.path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpenSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null; // Don't show admin sidebar if not logged in

  const isMobile = window.innerWidth < 768;
  const shouldShowSidebar = isMobile ? isMobileOpen : (isExpanded || isHovered);

  return (
    <>
      {/* Mobile Overlay */}
      {/* Overlay eliminado para permitir interacción con el sidebar en móvil */}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 mt-16 lg:mt-0 z-30 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out print:hidden
          ${shouldShowSidebar ? 'w-64' : 'w-16'}
          ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center px-4 py-4 cursor-pointer" onClick={toggleSidebar} title="Mostrar/Ocultar menú">
            {shouldShowSidebar ? (
              <>
                <img
                  className="h-10 w-auto object-contain p-0 m-0 dark:hidden"
                  src="/images/logo/techvel-logo.png"
                  alt="Techvel Logo"
                  style={{ background: 'none', boxShadow: 'none' }}
                />
                <img
                  className="hidden h-10 w-auto object-contain p-0 m-0 dark:block"
                  src="/images/logo/techvel-logo-dark.png"
                  alt="Techvel Logo"
                  style={{ background: 'none', boxShadow: 'none' }}
                />
              </>
            ) : (
              <img
                className="h-10 w-10 object-contain p-0 m-0"
                src="/images/logo/techvel-icon.png"
                alt="Techvel Icon"
                style={{ background: 'none', boxShadow: 'none' }}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto pt-0 pb-4">
            <nav className="px-3">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.path && !item.subItems ? (
                      // Simple link without submenu
                      <Link
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActive(item.path)
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {shouldShowSidebar && <span>{item.name}</span>}
                      </Link>
                    ) : (
                      // Item with submenu
                      <div>
                        <button
                          onClick={() => toggleSubmenu("main", item.name)}
                          className={`
                            w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isParentActive(item.subItems) || isSubmenuOpen("main", item.name)
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex-shrink-0">{item.icon}</span>
                            {shouldShowSidebar && <span>{item.name}</span>}
                          </div>
                          {shouldShowSidebar && (
                            <div
                              className={`transform transition-transform ${
                                isSubmenuOpen("main", item.name) ? 'rotate-180' : ''
                              }`}
                            >
                              <ChevronDownIcon />
                            </div>
                          )}
                        </button>

                        {/* Submenu */}
                        {shouldShowSidebar && isSubmenuOpen("main", item.name) && item.subItems && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.path}
                                onClick={subItem.action}
                                className={`
                                  block px-3 py-2 text-sm rounded-lg transition-colors
                                  ${isActive(subItem.path)
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  {subItem.name.includes('Nueva') || subItem.name.includes('Nuevo') ? (
                                    <PlusIcon />
                                  ) : null}
                                  {subItem.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>

          {/* Footer */}
          {shouldShowSidebar && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Técnica Administrativa v1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;