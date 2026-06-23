import { Menu, UserCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    const ticketSystemUrl = import.meta.env.VITE_TICKET_APP_URL || 'http://localhost:5174';
    window.location.replace(ticketSystemUrl);
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8 w-full sticky top-0 z-40 shadow-sm transition-colors duration-300">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-6 w-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-foreground">SN Enviro</h1>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-foreground">{user?.name || 'Admin User'}</span>
            <span className="text-xs text-primary capitalize">{user?.role || 'Admin'}</span>
          </div>
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div className="h-6 w-px bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
