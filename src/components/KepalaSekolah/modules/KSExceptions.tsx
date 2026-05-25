import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface TeacherException {
  id: string;
  name: string;
  status: string;
  label: string;
  initials: string;
}

interface KSExceptionsProps {
  exceptions: TeacherException[];
  onAction: (targetTab: any) => void;
}

export function KSExceptions({ exceptions, onAction }: KSExceptionsProps) {
  if (exceptions.length === 0) return null;

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
       <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-50" />
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200">
                   <ShieldCheck size={20} />
                </div>
                <span>Perhatian Khusus (Exception)</span>
             </h3>
             <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                {exceptions.length} Guru Memerlukan Tindakan
             </span>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
             {exceptions.map(guru => (
                <motion.div 
                  key={guru.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-[280px] p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-rose-300 transition-all group shrink-0"
                >
                   <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${guru.status === 'RED' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                         {guru.initials}
                      </div>
                      <div>
                         <div className="font-black text-slate-800 text-sm tracking-tight">{guru.name}</div>
                         <div className={`text-[8px] font-black uppercase tracking-widest ${guru.status === 'RED' ? 'text-rose-500' : 'text-amber-600'}`}>{guru.label}</div>
                      </div>
                   </div>
                   <button 
                     onClick={() => onAction(guru.status === 'RED' ? 'school-docs' : 'verification')}
                     className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                   >
                      Monitor Aktivitas
                   </button>
                </motion.div>
             ))}
          </div>
       </div>
    </div>
  );
}
