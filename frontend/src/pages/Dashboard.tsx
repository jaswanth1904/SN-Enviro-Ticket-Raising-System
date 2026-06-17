import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    
    // Listen for live updates
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
  const criticalCount = tickets.filter(t => t.status !== 'Resolved').length; // Simplified logic

  const trendData = [
    { name: 'Mon', tickets: 12 }, { name: 'Tue', tickets: 19 }, { name: 'Wed', tickets: 15 },
    { name: 'Thu', tickets: 22 }, { name: 'Fri', tickets: 18 }, { name: 'Sat', tickets: 8 }, { name: 'Sun', tickets: 5 },
  ];

  const pieData = [
    { name: 'Hardware Fault', value: 10 }, { name: 'Software Issue', value: 5 }, { name: 'Other', value: 15 },
  ];
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];

  if (loading) return <div className="p-8 text-blue-600 animate-pulse font-medium">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
          <Activity className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time Service Requests & Metrics</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active Tickets', value: pendingCount + inProgressCount, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50', trend: '-12% velocity', TrendIcon: TrendingDown, trendColor: 'text-emerald-500' },
          { title: 'Pending Assignment', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', trend: '+4% backlog', TrendIcon: TrendingUp, trendColor: 'text-rose-500' },
          { title: 'Critical Issues', value: criticalCount, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50', trend: 'Requires action', TrendIcon: AlertTriangle, trendColor: 'text-rose-500' },
          { title: 'Resolved (30D)', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '98.2% SLA met', TrendIcon: TrendingUp, trendColor: 'text-emerald-500' }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate('/tickets')}
            className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md hover:border-blue-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-baseline space-x-3">
              <span className={`text-4xl font-bold ${i === 2 ? 'text-rose-600' : 'text-gray-900'}`}>{stat.value}</span>
            </div>
            <div className={`flex items-center mt-3 text-xs font-medium ${stat.trendColor}`}>
              <stat.TrendIcon className="h-4 w-4 mr-1" />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-7 pt-4">
        <div className="xl:col-span-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-gray-900">Ticket Trends <span className="text-gray-500 text-sm font-normal ml-2">(7 Days)</span></h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#2563eb', fontWeight: '500' }}
                />
                <Line type="monotone" dataKey="tickets" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Hardware vs. Software</p>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900">{tickets.length}</span>
              <span className="text-xs text-gray-500 uppercase font-semibold mt-1">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
