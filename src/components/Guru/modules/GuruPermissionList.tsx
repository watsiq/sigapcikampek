import React from 'react';
import { Permission } from '../../../types';

interface GuruPermissionListProps {
  permissions: Permission[];
}

export function GuruPermissionList({ permissions }: GuruPermissionListProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
      <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">Alur Perizinan</h3>
      <div className="space-y-4">
        {permissions.slice(0, 3).map((p: any) => (
          <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{p.type}</div>
              <div className="text-[9px] text-slate-400 font-bold">{new Date(p.startDate).toLocaleDateString()}</div>
            </div>
            <span className={`${
              p.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
              p.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
            } px-2 py-0.5 rounded-md text-[8px] font-black uppercase`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
