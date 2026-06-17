import React from 'react';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 w-full sticky top-0 z-40 shadow-sm">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6 text-gray-600" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-gray-900">SN Enviro</h1>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</span>
            <span className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</span>
          </div>
          <UserCircle className="h-8 w-8 text-gray-400" />
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
