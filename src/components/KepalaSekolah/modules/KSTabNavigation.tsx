import React from 'react';

interface KSTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  counts: {
    pendingDocs: number;
    pendingPerms: number;
    pendingManualAtt: number;
  };
}

export function KSTabNavigation({ activeTab, setActiveTab, counts }: KSTabNavigationProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 px-1">
          <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verifikasi & Evaluasi</h3>
        </div>
        <div className="flex p-1.5 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar">
          {[
            { id: 'verification', label: 'Berkas Guru', count: counts.pendingDocs },
            { id: 'school-docs', label: 'Info Strategis', count: 0 },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 flex items-center space-x-2 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-rose-100 text-rose-600'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 px-1">
          <div className="w-1 h-5 bg-rose-600 rounded-full"></div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Perlu Persetujuan</h3>
        </div>
        <div className="flex p-1.5 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar">
          {[
            { id: 'permissions', label: 'Dinas/Izin/Cuti', count: counts.pendingPerms },
            { id: 'manual-attendance', label: 'Perbaikan Presensi', count: counts.pendingManualAtt }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 flex items-center space-x-2 ${activeTab === tab.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${activeTab === tab.id ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
