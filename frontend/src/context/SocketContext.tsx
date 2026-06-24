import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const apiPropsUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const socketUrl = apiPropsUrl.replace('/api/v1', '');
      const newSocket = io(socketUrl);
      
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      // Global Listeners for Notifications
      newSocket.on('ticket_created', (ticket) => {
        toast.success(`New Ticket Created: ${ticket.ticketId}`);
      });

      newSocket.on('ticket_updated', (ticket) => {
        toast(`Ticket ${ticket.ticketId} updated remotely`, { icon: '🔄' });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
