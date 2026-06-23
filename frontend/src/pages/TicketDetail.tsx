import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, CheckCircle, Cpu, Clock, Mail, User, ArrowRight, ExternalLink, X } from 'lucide-react';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closingNotes, setClosingNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get('/tickets');
        if (response.data.success) {
          const found = response.data.data.find((t: any) => t._id === id);
          setTicket(found);
        }
      } catch (error) {
        console.error('Failed to fetch ticket details', error);
      } finally {
        setLoading(false);
      }
    };
    
    // In a real app we'd fetch users from an API endpoint
    // For this UI, we'll just mock it or fetch if endpoint exists
    setUsers([
      { _id: 'tech1', name: 'Field Eng. Rajesh' },
      { _id: 'tech2', name: 'Field Eng. Sarah' }
    ]);
    
    fetchTicket();
  }, [id]);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const finalNotes = closingNotes.trim() === '' 
        ? "Issue has been resolved." 
        : closingNotes;
        
      const response = await api.patch(`/tickets/${id}`, { status: 'Resolved', notes: finalNotes });
      
      if (response.data.emailSent) {
        toast.success('Ticket Resolved & Email Sent!');
      } else {
        toast('Ticket Resolved (Email failed, check server logs)', { icon: '⚠️' });
      }
      
      navigate('/tickets');
    } catch (error) {
      console.error('Failed to resolve ticket', error);
      toast.error('Error resolving ticket');
    } finally {
      setIsResolving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error('Please select a technician');
      return;
    }
    try {
      const response = await api.patch(`/tickets/${id}`, { assignedTo: selectedUser });
      
      if (response.data.emailSent) {
        toast.success('Ticket Assigned & Email Forwarded!');
      } else {
        toast('Ticket Assigned (Email failed, check server logs)', { icon: '⚠️' });
      }
      
      // Refresh ticket state
      setTicket((prev: any) => ({ ...prev, assignedTo: { name: users.find(u => u._id === selectedUser)?.name } }));
    } catch (error) {
      toast.error('Error assigning ticket');
    }
  };

  if (loading) return <div className="p-8 text-blue-600 font-medium animate-pulse">Loading Ticket Details...</div>;
  if (!ticket) return <div className="p-8 text-red-500 font-medium">Ticket not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <button onClick={() => navigate('/tickets')} className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tickets
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Details */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-3">
              <h2 className="text-3xl font-bold text-gray-900">{ticket.ticketId}</h2>
              <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {ticket.status}
              </span>
            </div>
            <h3 className="text-lg text-gray-700 font-medium">{ticket.subject}</h3>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500">
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Cpu className="w-4 h-4 mr-2 text-gray-400" /> Station {ticket.stationId?.stationNumber}</span>
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {ticket.stationId?.industryName}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> Raised {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Issue Description</h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{ticket.description}</p>
              </div>

              {ticket.s3ImageUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Attached Evidence</h4>
                  {(() => {
                    const safeImageUrl = ticket.s3ImageUrl.includes('mock-s3-bucket') 
                      ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000' 
                      : ticket.s3ImageUrl;
                    return (
                      <>
                        <div onClick={() => setIsImageModalOpen(true)} className="block cursor-pointer hover:opacity-90 transition-opacity group">
                          <img src={safeImageUrl} alt="Evidence" className="max-w-full max-h-[400px] object-contain bg-gray-50 rounded-xl border border-gray-200" />
                          <p className="text-xs text-blue-600 mt-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            <ExternalLink className="w-3 h-3 mr-1" /> Click to view full resolution
                          </p>
                        </div>
                        
                        {isImageModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsImageModalOpen(false)}>
                            <button 
                              onClick={() => setIsImageModalOpen(false)}
                              className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors z-50"
                            >
                              <X className="w-8 h-8" />
                            </button>
                            <img src={safeImageUrl} alt="Evidence Full" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="w-full lg:w-[400px] space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Automation & Actions</h3>
            </div>
            
            <div className="space-y-4">
              {/* Redesigned Assign Technician UI */}
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden mb-6">
                <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Assign Technician</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Automated HTML email dispatch</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="email"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="e.g. technician@gmail.com"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={handleAssign} 
                      disabled={!selectedUser}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                    >
                      Forward Email
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                  {ticket.assignedTo && (
                    <div className="mt-4 flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                      <p className="text-xs text-emerald-800">
                        Currently assigned to <span className="font-bold">{ticket.assignedTo.email || ticket.assignedTo.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Resolution Log (Email Trigger)</label>
                <textarea
                  className="w-full h-32 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Enter final closure notes. This will be emailed."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                />
                <button 
                  onClick={handleResolve}
                  disabled={isResolving || ticket.status === 'Resolved'}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isResolving ? 'Resolving...' : 'Resolve Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
