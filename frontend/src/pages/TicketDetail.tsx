import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, CheckCircle, Cpu, Clock, Mail, User, ArrowRight, ExternalLink, X, AlertCircle } from 'lucide-react';
import { engineersData } from '../lib/engineers';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closingNotes, setClosingNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
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
      
      setTicket((prev: any) => ({ 
        ...prev, 
        assignedTo: { 
          email: selectedUser,
          name: selectedUser.split('@')[0]
        } 
      }));
      setSelectedUser('');
    } catch (error) {
      toast.error('Error assigning ticket');
    }
  };

  const filteredEngineers = engineersData.filter(e => 
    e.name.toLowerCase().includes(selectedUser.toLowerCase()) || 
    e.email.toLowerCase().includes(selectedUser.toLowerCase())
  );

  if (loading) return <div className="p-8 text-blue-600 font-medium animate-pulse">Loading Ticket Details...</div>;
  if (!ticket) return <div className="p-8 text-red-500 font-medium">Ticket not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 px-4 sm:px-6">
      <button onClick={() => navigate('/tickets')} className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tickets
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Details */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{ticket.subject}</h2>
              <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {ticket.status}
              </span>
            </div>
            <h3 className="text-xl text-gray-500 font-mono font-semibold">#{ticket.ticketId}</h3>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500 font-medium">
              <span className="flex items-center bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100"><Cpu className="w-4.5 h-4.5 mr-2.5 text-gray-400" /> Station {ticket.stationId?.stationNumber}</span>
              <span className="flex items-center"><MapPin className="w-4.5 h-4.5 mr-2 text-gray-400" /> {ticket.stationId?.industryName}</span>
              {ticket.telemetryIssueType && (
                <span className="flex items-center bg-blue-50/50 px-3.5 py-2 rounded-lg border border-blue-100/50 text-blue-700 font-bold">
                  <AlertCircle className="w-4.5 h-4.5 mr-2.5 text-blue-500" /> {ticket.telemetryIssueType}
                </span>
              )}
              <span className="flex items-center"><Clock className="w-4.5 h-4.5 mr-2 text-gray-400" /> Raised {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Issue Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100 text-[15px]">{ticket.description}</p>
              </div>

              {ticket.remoteSoftware && ticket.remoteSoftware !== 'None' && (
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-6">
                  <h4 className="text-sm font-extrabold text-emerald-800 mb-4 uppercase tracking-wider flex items-center">
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2.5 animate-pulse"></span>
                    Remote Access Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Software Tool</span>
                      <span className="text-[15px] font-bold text-gray-800">{ticket.remoteSoftware}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block tracking-wider mb-1">User ID / Name</span>
                      <span className="text-[15px] font-mono font-bold text-gray-800 select-all">{ticket.remoteId || 'N/A'}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Password</span>
                      <span className="text-[15px] font-mono font-bold text-gray-800 select-all">{ticket.remotePassword || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {ticket.s3ImageUrl && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Attached Evidence</h4>
                  {(() => {
                    const safeImageUrl = ticket.s3ImageUrl.includes('mock-s3-bucket') 
                      ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000' 
                      : ticket.s3ImageUrl;
                    return (
                      <>
                        <div onClick={() => setIsImageModalOpen(true)} className="block cursor-pointer hover:opacity-90 transition-opacity group">
                          <img src={safeImageUrl} alt="Evidence" className="max-w-full max-h-[400px] object-contain bg-gray-50 rounded-xl border border-gray-200 shadow-sm" />
                          <p className="text-xs text-blue-600 mt-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wider">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Click to view full resolution
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

        {/* Right Column: Actions (Now only contains Assign Technician) */}
        <div className="w-full lg:w-[400px] space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-5 mb-8">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Automation</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-visible">
                <div className="bg-blue-50/40 p-5 border-b border-blue-100 flex items-center space-x-4">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900">Assign Technician</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Automated HTML email dispatch</p>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Changed to flex-col to give maximum width to the input */}
                  <div className="flex flex-col space-y-4">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                        placeholder="Search name or email..."
                        value={selectedUser}
                        onChange={(e) => {
                          setSelectedUser(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      />
                      
                      {/* Autocomplete Dropdown: onMouseDown fixes the click bug */}
                      {showDropdown && selectedUser && filteredEngineers.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden left-0 top-full">
                          {filteredEngineers.map((engineer, idx) => (
                            <div 
                              key={idx}
                              className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex items-center"
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevents input blur
                                setSelectedUser(engineer.email);
                                setShowDropdown(false);
                              }}
                            >
                              <Mail className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                              <span className="text-[15px] text-gray-800 font-semibold truncate">{engineer.email}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleAssign} 
                      disabled={!selectedUser || !selectedUser.includes('@')}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-[15px] font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap"
                    >
                      Forward Email
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                  
                  {ticket.assignedTo && (
                    <div className="mt-5 flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
                      <p className="text-[13px] text-emerald-900 leading-tight">
                        Currently assigned to <br/>
                        <span className="font-extrabold text-[14px] mt-0.5 block">{ticket.assignedTo.email || ticket.assignedTo.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Simple Resolution Action at the bottom */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm shrink-0">
            <CheckCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Close & Resolve</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">This will resolve the ticket and automatically notify stakeholders.</p>
          </div>
        </div>
        
        <button 
          onClick={handleResolve}
          disabled={isResolving || ticket.status === 'Resolved'}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[15px] font-bold tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          {isResolving ? 'Resolving...' : 'Resolve & Trigger Email'}
        </button>
      </div>
    </div>
  );
};
