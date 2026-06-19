import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Send, Hexagon, WifiOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { motion } from 'framer-motion';

export const TicketForm: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    stationId: '',
    manualStationName: '',
    locationDetails: '',
    subject: '',
    telemetryIssueType: '',
    description: '',
  });
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Fetch stations safely
    api.get('/stations')
      .then(res => {
        if(res.data && res.data.data) {
           setStations(res.data.data);
        }
      })
      .catch(console.error);
    // Network connectivity listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Dummy S3 upload for demonstration
      let s3ImageUrl = null;
      if (image) {
        await new Promise(r => setTimeout(r, 500));
        s3ImageUrl = 'https://mock-s3-bucket.s3.amazonaws.com/fault-image.jpg';
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

      const res = await api.post('/tickets', payload);
      if (res.data.success) {
        toast.success('Issue Registered Successfully');
        navigate('/dashboard'); // or /tickets
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pb-20 mt-4 md:mt-0 p-4">
      {/* Offline Overlay */}
      {!isOnline && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-4 text-red-500"
          >
            <WifiOff className="h-16 w-16 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Internet Connection</h2>
          <p className="text-gray-600">Please connect to a network to submit telemetry reports. Your data is not currently syncing.</p>
        </motion.div>
      )}

      <div className="mb-8 text-center mt-4">
        <div className="flex items-center justify-center mb-3">
          <Hexagon className="h-10 w-10 text-primary mr-2 drop-shadow-sm" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">SN Enviro Ticket Raising Portal</h2>
        <p className="text-gray-600 text-sm mt-3 leading-relaxed max-w-[280px] mx-auto">
          Instantly dispatch field issues to the central dashboard. 
          Ensure all facility data is highly accurate for rapid triage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name / Station Name</label>
            <input
              required
              type="text"
              placeholder="e.g. North Sector Plant or STN-123"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.manualStationName}
              onChange={(e) => setFormData({ ...formData, manualStationName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specific Location</label>
            <input
              required
              type="text"
              placeholder="e.g. Boiler Room 4, Roof Deck..."
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.locationDetails}
              onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
            <input
              required
              type="text"
              placeholder="e.g. Power Failure, Sensor Offline"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.telemetryIssueType}
              onChange={(e) => setFormData({ ...formData, telemetryIssueType: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              required
              type="text"
              placeholder="Brief description of fault"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deep Description</label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact telemetry codes or physical damage details..."
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Camera Capture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Capture</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageCapture}
            />
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={imagePreview} alt="Fault preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white h-8 w-8" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all outline-none"
              >
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Tap to Snap Device Fault</span>
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed outline-none mt-4"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Hexagon className="h-5 w-5" />
              </motion.div>
              <span>Transmitting...</span>
            </div>
          ) : (
            <>
              <span>Submit Telemetry Report</span>
              <Send className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-12 text-center pb-8">
        <Link to="/login" className="text-gray-400 hover:text-primary text-sm transition-colors">
          Admin Login Portal
        </Link>
      </div>
    </div>
  );
};
