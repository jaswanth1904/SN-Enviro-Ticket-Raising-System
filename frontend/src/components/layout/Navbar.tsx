import { Menu, UserCircle, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    navigate('/logout', { replace: true });
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8 w-full sticky top-0 z-40 shadow-sm transition-colors duration-300">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-6 w-6 text-foreground" />
        </Button>
        <a href="/dashboard" className="flex flex-col ml-2 cursor-pointer hover:opacity-80 transition-opacity">
          <h1 className="text-lg font-bold text-foreground leading-tight">SN Enviro</h1>
          <span className="text-xs font-semibold text-blue-600">Ticket System</span>
        </a>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <div className="hidden md:flex flex-col items-end mr-4 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">SN Enviro Melody Live</span>
          <span className="text-[15px] font-mono font-bold text-gray-900 dark:text-gray-100">
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2 text-yellow-500 hover:bg-yellow-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

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
