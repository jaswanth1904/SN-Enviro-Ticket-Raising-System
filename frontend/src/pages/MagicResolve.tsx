import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
import api from '../services/api';

export const MagicResolve: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ticketId
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) {
      setStatus('error');
      setErrorMsg('Invalid or missing magic link.');
      return;
    }

    setStatus('loading');
    try {
      const response = await api.patch(`/tickets/${id}/magic-resolve`, { token, notes });
      
      if (response.data.success) {
        setStatus('success');
      } else {
        throw new Error(response.data.message || 'Failed to update ticket. The link may have expired.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred while connecting to the server.');
    }
  };

  if (!id || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-500">This resolution link is incomplete or missing a token.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-emerald-100">
          <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Updated!</h2>
          <p className="text-gray-600 mb-6">You have successfully marked ticket <span className="font-bold text-gray-900">{id}</span> as fixed.</p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium">
            The admin has been notified and will review your notes shortly. You can safely close this page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
           <img src="/logo.jpeg" alt="SN Enviro Logo" className="h-16 w-auto rounded-lg shadow-sm" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Resolve Ticket
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ticket ID: <span className="font-bold text-gray-900">{id}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {status === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-2">
                What did you fix? (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="e.g. Replaced the faulty temperature sensor and verified readings."
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send to Admin for Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
