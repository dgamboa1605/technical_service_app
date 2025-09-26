import { Outlet } from "react-router";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { ThemeProvider } from "../context/ThemeContext";
import AdminSidebar from "./AdminSidebar";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";

function AdminContent() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AdminSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-64" : "lg:ml-16"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AdminContent />
      </SidebarProvider>
    </ThemeProvider>
  );
}