import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const navigate = useNavigate();

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

  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const inProgressCount = tickets.filter(t => t.status === 'In-Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const criticalCount = tickets.filter(t => t.status !== 'Resolved').length;

  const getSLAHours = (ticket: any) => {
    const created = new Date(ticket.createdAt).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    const slaTarget = 48; // 48 hours SLA
    return Math.max(0, Math.floor(slaTarget - hoursElapsed));
  };

  if (loading) return <div className="p-8 text-cyan-400 animate-pulse font-medium">Initializing Executive Telemetry...</div>;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Activity className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Telemetry</h2>
          <p className="text-gray-600 text-sm mt-1">Real-time Service Requests & SLA Compliance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active Anomalies', value: pendingCount + inProgressCount, icon: Ticket, color: 'text-cyan-400', bg: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', hover: 'hover:border-cyan-500/50' },
          { title: 'Pending Triage', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/20', hover: 'hover:border-amber-500/50' },
          { title: 'Critical Outages', value: criticalCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', borderColor: 'border-red-500/20', hover: 'hover:border-red-500/50' },
          { title: 'Resolved (30D)', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', hover: 'hover:border-emerald-500/50' }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate('/tickets')}
            className={`bg-card/80 backdrop-blur-sm rounded-xl p-6 border ${stat.borderColor} shadow-sm transition-all duration-300 cursor-pointer ${stat.hover}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-baseline space-x-3">
              <span className={`text-4xl font-bold text-gray-900`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-7 pt-4">
        {/* Live Event Feed & SLA Timers */}
        <div className="xl:col-span-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Event Feed & SLA Timers</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {tickets.slice(0, 20).map((ticket) => {
                const sla = getSLAHours(ticket);
                const isCritical = sla < 12 && ticket.status !== 'Resolved';
                return (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-background/50 border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-600 font-mono text-sm">{ticket.ticketId}</span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{ticket.subject}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{ticket.stationId?.stationNumber || 'Unknown Station'} - {ticket.telemetryIssueType || 'General Issue'}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {ticket.status !== 'Resolved' ? (
                        <div className={`flex items-center space-x-1 ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-bold font-mono">{sla}h SLA</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-bold">Resolved</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {tickets.length === 0 && (
              <div className="text-center text-gray-500 mt-10">No recent events.</div>
            )}
          </div>
        </div>
        
        <div className="xl:col-span-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6 shadow-sm flex flex-col h-[500px] justify-center items-center">
             <Activity className="h-16 w-16 text-cyan-400/20 mb-4 animate-pulse" />
             <p className="text-gray-500 font-mono text-sm">System Nominal</p>
        </div>
      </div>
    </div>
  );
};
