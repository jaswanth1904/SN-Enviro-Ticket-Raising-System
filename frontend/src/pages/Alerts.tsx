import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { format } from 'date-fns';
import { Bell, CheckCircle2, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const Alerts: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      if (response.data.success) {
        // Filter only pending review tickets
        setTickets(response.data.data.filter((t: any) => t.status === 'Pending Review'));
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('ticket_updated', (updatedTicket) => {
      if (updatedTicket.status === 'Pending Review') {
        setTickets(prev => {
          const exists = prev.find(t => t._id === updatedTicket._id);
          if (exists) return prev.map(t => t._id === updatedTicket._id ? updatedTicket : t);
          return [updatedTicket, ...prev];
        });
        toast.success(`New Alert: Engineer resolved ticket ${updatedTicket.ticketId}`);
      } else {
        // If status changed to something else (e.g. Resolved), remove it from alerts
        setTickets(prev => prev.filter(t => t._id !== updatedTicket._id));
      }
    });

    return () => {
      socket.off('ticket_updated');
    };
  }, [socket]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
        <div className="p-3 bg-red-100 rounded-xl flex items-center justify-center">
          <Bell className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Alerts</h2>
          <p className="text-gray-500 mt-1">Review tickets marked as fixed by engineers before resolving them.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">There are no pending tickets awaiting your review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      Needs Review
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {ticket.ticketId}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                  
                  {ticket.notes && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Engineer Notes
                      </div>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap font-medium">{ticket.notes}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 flex items-center">
                    Assigned to: <span className="font-bold text-gray-900 ml-1">{ticket.assignedTo?.name || 'Unknown'}</span>
                    <span className="mx-2">•</span>
                    Completed: {format(new Date(ticket.updatedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-3">
                  <button
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Review Ticket
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
