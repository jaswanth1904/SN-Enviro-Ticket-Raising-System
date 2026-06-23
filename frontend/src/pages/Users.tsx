import React from 'react';
import { Users as UsersIcon, Mail, Briefcase, Clock, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const engineers = [
  { name: 'SIVA KISHORE', email: 'sivakishore434@gmail.com', designation: 'Embedded Engineer', experience: '1+ Years', status: 'Active' },
  { name: 'TASMIN SHAIK', email: 'shaiktasmin802@gmail.com', designation: 'Telemetry Technician', experience: '8+ Months', status: 'Active' },
  { name: 'USHA RANI', email: 'gadeusharani6@gmail.com', designation: 'Field Support Engineer', experience: '1+ Years', status: 'Active' },
  { name: 'MURALI', email: 'muralikancherla7032@gmail.com', designation: 'Hardware Specialist', experience: '8+ Months', status: 'Active' },
  { name: 'VACHU', email: 'vachaspathi.2434@gmail.com', designation: 'Network Technician', experience: '8+ Months', status: 'Active' }
];

export const Users: React.FC = () => {
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied ${email} to clipboard!`);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Engineers & Technicians</h2>
            <p className="text-gray-500 text-sm mt-1">Manage field engineers and technicians</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engineers.map((engineer, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {engineer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{engineer.name}</h3>
                    <div className="flex items-center text-emerald-600 text-xs font-semibold mt-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {engineer.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <Briefcase className="w-4 h-4 text-blue-500 mr-3 shrink-0" />
                  <span className="font-medium">{engineer.designation}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <Clock className="w-4 h-4 text-blue-500 mr-3 shrink-0" />
                  <span className="font-medium">{engineer.experience} Experience</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center truncate mr-2">
                    <Mail className="w-4 h-4 text-blue-600 mr-3 shrink-0" />
                    <span className="font-medium text-blue-900 truncate">{engineer.email}</span>
                  </div>
                  <button 
                    onClick={() => handleCopyEmail(engineer.email)}
                    className="p-1.5 text-blue-600 hover:bg-blue-200 bg-blue-100 rounded-md transition-colors shrink-0"
                    title="Copy Email for Assignment"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
