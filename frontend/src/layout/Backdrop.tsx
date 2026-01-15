import { useSidebar } from "../context/SidebarContext";
import { useEffect } from "react";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  // Prevenir scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
      onClick={toggleMobileSidebar}
      aria-hidden="true"
    />
  );
};

export default Backdrop;
