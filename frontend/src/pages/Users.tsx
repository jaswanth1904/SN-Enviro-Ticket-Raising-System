import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

export const Users: React.FC = () => {
  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
          <UsersIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operators Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage field engineers and technicians</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-500">Operator management features will be available in the next iteration.</p>
        <p className="text-sm text-gray-400 mt-2">Currently showing 2 mock field engineers in the assignment dropdowns.</p>
      </div>
    </div>
  );
};
