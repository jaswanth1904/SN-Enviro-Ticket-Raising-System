import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, Hexagon, X, MapPin, AlertCircle, FileText, Factory, ShieldCheck, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from './services/api';
import { db } from './services/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    stationId: '',
    manualStationName: '',
    locationDetails: '',
    subject: '',
    telemetryIssueType: '',
    description: '',
    contactEmail: '',
  });
  const [location] = useState<{ lat: number, lng: number } | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const syncOfflineTickets = async () => {
    try {
      const offlineRecords = await db.offlineTickets.toArray();
      if (offlineRecords.length === 0) return;

      toast.loading(`Syncing ${offlineRecords.length} offline records...`, { id: 'sync-toast' });
      
      for (const record of offlineRecords) {
        try {
          await api.post('/tickets', record.payload);
          await db.offlineTickets.delete(record.id as number);
        } catch (err) {
          console.error('Failed to sync offline record:', err);
        }
      }
      
      toast.success('Offline records synced successfully', { id: 'sync-toast' });
    } catch (error) {
      console.error('Error during offline sync:', error);
      toast.error('Failed to sync offline records', { id: 'sync-toast' });
    }
  };

  useEffect(() => {
    // Network connectivity listeners
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineTickets();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      syncOfflineTickets();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress the image (70% quality JPEG)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedDataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let s3ImageUrl = null;
      if (image && imagePreview) {
        s3ImageUrl = imagePreview; // Use the captured base64 image
      }

      const payload = {
        ...formData,
        s3ImageUrl,
        stationId: 'STN-999', // Tell backend to process as manual entry
        fieldEngineerLocation: location ? {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        } : undefined
      };

      if (!isOnline) {
        await db.offlineTickets.add({ payload, timestamp: Date.now() });
        toast.success('Connection offline. Tracking record queued securely in client memory.', { duration: 5000 });
        setFormData({ stationId: '', manualStationName: '', locationDetails: '', subject: '', telemetryIssueType: '', description: '', contactEmail: '' });
        setImage(null);
        setImagePreview(null);
        return;
      }

      const res = await api.post('/tickets', payload);
      if (res.data.success) {
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-background via-white to-secondary/30 relative font-sans overflow-x-hidden">
        
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-72 h-72 bg-secondary/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>

        <div className="max-w-md mx-auto w-full pb-24 pt-8 md:pt-12 px-4 relative z-10">

          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-30"></div>
                <img src="/client/logo.jpeg" alt="Logo" className="relative h-16 w-16 object-cover drop-shadow-xl rounded-full border-2 border-white/50" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">SN enviro Ticket System</h2>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-[280px] mx-auto font-medium">
              Report issues quickly to our team. Make sure all details are correct so we can fix it fast.
            </p>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 rounded-[2rem] p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-5">
                <div className="relative group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-primary">Plant / Station Name</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">
                      <Factory className="w-5 h-5" />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="e.g. North Sector Plant"
                      className="w-full bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none placeholder:text-gray-400 font-medium text-[15px]"
                      value={formData.manualStationName}
                      onChange={(e) => setFormData({ ...formData, manualStationName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-primary">Your Email (For Updates)</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input
                      required
                      type="email"
                      placeholder="e.g. engineer@snenviro.com"
                      className="w-full bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none placeholder:text-gray-400 font-medium text-[15px]"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-primary">Specific Location</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Boiler Room 4"
                      className="w-full bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none placeholder:text-gray-400 font-medium text-[15px]"
                      value={formData.locationDetails}
                      onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-primary">Issue Category</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Power Failure"
                      className="w-full bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none placeholder:text-gray-400 font-medium text-[15px]"
                      value={formData.telemetryIssueType}
                      onChange={(e) => setFormData({ ...formData, telemetryIssueType: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-primary">Subject</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="Brief description"
                      className="w-full bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none placeholder:text-gray-400 font-medium text-[15px]"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-primary">Deep Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide exact telemetry codes or physical damage details..."
                    className="w-full bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 resize-none transition-all outline-none placeholder:text-gray-400 font-medium text-[15px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Camera Capture */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Evidence Capture</label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                      <img src={imagePreview} alt="Fault preview" className="w-full h-56 object-cover cursor-pointer hover:scale-105 transition-transform duration-500" onClick={() => fileInputRef.current?.click()} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Camera className="text-white h-10 w-10 drop-shadow-lg" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md hover:bg-red-500 text-white rounded-full transition-colors z-10 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-primary/30 bg-primary/[0.03] rounded-2xl p-8 flex flex-col items-center justify-center text-primary/70 hover:text-primary hover:border-primary/60 hover:bg-primary/[0.08] transition-all outline-none group"
                    >
                      <div className="bg-white p-3.5 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-[15px] font-bold tracking-wide">Tap to Snap Evidence</span>
                      <span className="text-xs text-gray-500 mt-1 font-medium">Include clear photo of fault</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.12)] flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed outline-none"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Hexagon className="h-5 w-5 text-white/80" />
                      </motion.div>
                      <span>Transmitting...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-[16px]">SUBMIT TICKET</span>
                      <Send className="h-5 w-5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <a 
              href={adminUrl}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/30 rounded-xl transition-all group shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
            >
              <ShieldCheck className="w-4 h-4 text-gray-500 group-hover:text-gray-800 transition-colors" />
              <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Admin Dashboard</span>
            </a>
          </motion.div>

          <div className="mt-8 text-center pb-8">
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Powered by SN ENVIRO</p>
          </div>
        </div>
        
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-gray-100"
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Ticket Sent Successfully!</h3>
                <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
                  Please wait patiently, we will get back to you in 24-48 hours.
                </p>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setFormData({ stationId: '', manualStationName: '', locationDetails: '', subject: '', telemetryIssueType: '', description: '', contactEmail: '' });
                    setImage(null);
                    setImagePreview(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

