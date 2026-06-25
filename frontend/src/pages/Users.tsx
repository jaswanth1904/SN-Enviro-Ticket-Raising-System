import React from 'react';
import { Users as UsersIcon, Mail, Briefcase, MapPin, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupedEngineers, type Engineer } from '../lib/engineers';

export const Users: React.FC = () => {
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied ${email} to clipboard!`);
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Engineers & Technicians</h2>
            <p className="text-gray-500 text-sm mt-1">Manage field engineers and technicians across regions</p>
          </div>
        </div>
      </div>

      {Object.entries(groupedEngineers).map(([region, engineers]) => (
        <div key={region} className="space-y-4">
          {/* Region Header */}
          <div className="flex items-center space-x-3 border-b border-gray-200 pb-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-800">{region} Region</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {engineers.length} {engineers.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {engineers.map((engineer: Engineer, index: number) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden group transform hover:-translate-y-1">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                        {engineer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 text-[15px] truncate" title={engineer.name}>{engineer.name}</h3>
                        <div className="flex items-center text-emerald-600 text-[11px] font-semibold mt-0.5">
                          <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                          Active
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-5">
                    <div className="flex items-center text-[13px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <Briefcase className="w-4 h-4 text-blue-500 mr-2.5 shrink-0" />
                      <span className="font-medium truncate" title={engineer.designation}>{engineer.designation}</span>
                    </div>
                    
                    <div className="flex items-center text-[13px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <MapPin className="w-4 h-4 text-blue-500 mr-2.5 shrink-0" />
                      <span className="font-medium truncate" title={engineer.region}>{engineer.region}</span>
                    </div>

                    <div className="flex items-center justify-between text-[13px] text-gray-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 group-hover:bg-blue-50 transition-colors mt-2">
                      <div className="flex items-center truncate mr-2">
                        <Mail className="w-4 h-4 text-blue-600 mr-2.5 shrink-0" />
                        <span className="font-medium text-blue-900 truncate" title={engineer.email}>{engineer.email}</span>
                      </div>
                      <button 
                        onClick={() => handleCopyEmail(engineer.email)}
                        className="p-1.5 text-blue-600 hover:bg-blue-200 bg-blue-100 rounded-md transition-colors shrink-0"
                        title="Copy Email for Assignment"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
