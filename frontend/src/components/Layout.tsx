import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 flex flex-col z-40 w-full max-w-xs bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b bg-white">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 md:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="ml-2 md:ml-0 text-lg md:text-xl font-semibold text-gray-800">
              {title}
            </h1>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout; 