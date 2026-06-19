import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { PageLayout } from './components/layout/PageLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { TicketDetail } from './pages/TicketDetail';
import { TicketForm } from './pages/TicketForm';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <PageLayout>{children}</PageLayout>;
};

// Admin Route Wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/tickets/new" replace />;
  return <PageLayout>{children}</PageLayout>;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'field_engineer') return <Navigate to="/tickets/new" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const { socket } = useSocket();

  React.useEffect(() => {
    if (!socket) return;
    
    const handleNewTicket = (newTicket: any) => {
      // Global toast notification for admins when a new ticket arrives
      toast.success(`New Ticket Raised: ${newTicket.ticketId} - ${newTicket.subject}`, {
        duration: 5000,
        icon: '🚨',
      });
    };

    socket.on('ticket_created', handleNewTicket);

    return () => {
      socket.off('ticket_created', handleNewTicket);
    };
  }, [socket]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/tickets/new" element={<TicketForm />} />
      
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* Admin only routes */}
      <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/tickets" element={<AdminRoute><Tickets /></AdminRoute>} />
      <Route path="/tickets/:id" element={<AdminRoute><TicketDetail /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />

      <Route path="/" element={<Navigate to="/tickets/new" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
