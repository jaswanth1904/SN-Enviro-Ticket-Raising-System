import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, Settings, Hexagon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Field Portal', icon: Ticket, path: '/tickets/new', showTo: ['admin', 'field_engineer'] },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', showTo: ['admin'] },
    { label: 'Tickets', icon: Ticket, path: '/tickets', showTo: ['admin'] },
    { label: 'Operators', icon: Users, path: '/users', showTo: ['admin'] },
    { label: 'System Config', icon: Settings, path: '/settings', showTo: ['admin', 'field_engineer'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.showTo.includes(user.role));

  return (
    <aside className={cn("flex flex-col w-64 bg-card/80 backdrop-blur-xl border-r border-border h-screen fixed top-0 left-0 z-50", className)}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center">
          <Hexagon className="h-8 w-8 text-primary mr-2 drop-shadow-sm" />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">SN Enviro</h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-600 hover:text-gray-900">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
