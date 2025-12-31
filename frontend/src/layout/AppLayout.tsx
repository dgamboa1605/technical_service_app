import { Outlet } from "react-router";
import PublicHeader from "./PublicHeader";
import AppFooter from "./AppFooter";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-6 px-4 mx-auto max-w-7xl w-full md:py-8 md:px-6 lg:py-10">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
