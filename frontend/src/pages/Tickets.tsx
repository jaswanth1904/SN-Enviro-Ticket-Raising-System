import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { differenceInHours } from 'date-fns';
import { Search, Filter, Layers } from 'lucide-react';

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      if (response.data.success) {
        setTickets(response.data.data);
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
    
    socket.on('ticket_created', (newTicket) => {
      setTickets(prev => [newTicket, ...prev]);
    });
    
    socket.on('ticket_updated', (updatedTicket) => {
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    });

    return () => {
      socket.off('ticket_created');
      socket.off('ticket_updated');
    };
  }, [socket]);

  const getSLABadge = (createdAt: string, status: string) => {
    if (status === 'Resolved') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Resolved</span>;
    
    const hoursElapsed = differenceInHours(new Date(), new Date(createdAt));
    const hoursRemaining = 48 - hoursElapsed;

    if (hoursRemaining < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">Breached ({Math.abs(hoursRemaining)}h over)</span>;
    }
    if (hoursRemaining <= 24) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{hoursRemaining}h left</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{hoursRemaining}h left</span>;
  };

  const getStatusDot = (status: string) => {
    if (status === 'Resolved') return "bg-emerald-500";
    if (status === 'Pending') return "bg-amber-500";
    return "bg-blue-500";
  };

  const filteredTickets = tickets.filter(t => 
    t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.stationId?.stationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
            <Layers className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
            <p className="text-gray-500 text-sm mt-1">Manage and assign service requests</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search ID, Station, or Subject..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="h-[42px] px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-blue-600 animate-pulse font-medium">Loading Tickets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Ticket ID</th>
                  <th className="px-6 py-4 font-semibold">Station Target</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Assigned Operative</th>
                  <th className="px-6 py-4 font-semibold text-right">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket._id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(ticket.status)}`} />
                        <span className="font-medium text-gray-700">{ticket.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{ticket.ticketId}</td>
                    <td className="px-6 py-4 text-gray-900">
                      <span className="font-medium">Stn {ticket.stationId?.stationNumber || '??'}</span>
                      <span className="text-gray-500 ml-2 text-xs">{ticket.stationId?.industryName || 'Unknown Location'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[250px] truncate">{ticket.subject}</td>
                    <td className="px-6 py-4">
                      {ticket.assignedTo?.name ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700">
                            {ticket.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-gray-700">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getSLABadge(ticket.createdAt, ticket.status)}
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
