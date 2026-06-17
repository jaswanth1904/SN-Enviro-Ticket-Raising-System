import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 w-full relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
