import React from 'react';
import { NetworkStatus } from '../../types';
import { Wifi, AlertTriangle, CloudOff, RefreshCw, CheckCircle } from 'lucide-react';

interface OfflineBannerProps {
  status: NetworkStatus;
  pendingSyncCount?: number;
  onStatusChange?: (status: NetworkStatus) => void;
  onSyncNow?: () => void;
  onForceSync?: () => void;
  isSyncing?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  status = 'online',
  pendingSyncCount = 0,
  onStatusChange,
  onSyncNow,
  onForceSync,
  isSyncing = false
}) => {
  const handleStatusChange = (newStatus: NetworkStatus) => {
    if (typeof onStatusChange === 'function') {
      onStatusChange(newStatus);
    }
  };

  const handleSync = () => {
    if (typeof onSyncNow === 'function') {
      onSyncNow();
    } else if (typeof onForceSync === 'function') {
      onForceSync();
    }
  };
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Network Telemetry:
            </span>
            {status === 'online' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ● Online
              </span>
            )}
            {status === 'limited' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                <AlertTriangle size={12} className="text-amber-600" />
                ⚠ Limited Connectivity
              </span>
            )}
            {status === 'offline' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300">
                <CloudOff size={12} className="text-slate-600" />
                ○ Offline Mode
              </span>
            )}
          </div>

          {status !== 'online' && (
            <span className="text-slate-600 hidden sm:inline">
              Data will sync automatically when connectivity is restored.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {pendingSyncCount > 0 ? (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-xs">
              <span className="text-slate-600">Pending Sync:</span>
              <span className="font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] border border-blue-100">
                {pendingSyncCount} reports
              </span>
              <button
                onClick={handleSync}
                disabled={isSyncing || status === 'offline'}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-white ${
                  status === 'offline' 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-blue-800 hover:bg-blue-900 active:scale-95'
                } transition-all`}
                title={status === 'offline' ? 'Switch to online or limited to sync' : 'Sync pending data'}
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          ) : (
            <span className="text-emerald-700 inline-flex items-center gap-1 text-[11px] font-medium hidden md:inline-flex">
              <CheckCircle size={12} /> All nodes synced
            </span>
          )}

          {/* Network Simulator Toggle for Demo / Government Inspections */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5">
            <button
              onClick={() => handleStatusChange('online')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                status === 'online' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => handleStatusChange('limited')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                status === 'limited' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Limited
            </button>
            <button
              onClick={() => handleStatusChange('offline')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                status === 'offline' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
