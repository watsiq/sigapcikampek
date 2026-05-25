import React from 'react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';
import { MONTHS } from '../../../constants';

interface GuruAttendanceChartProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  chartData: { name: string; value: number; color: string }[];
}

export function GuruAttendanceChart({ 
  selectedMonth, 
  setSelectedMonth, 
  chartData 
}: GuruAttendanceChartProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Detail Presensi</h3>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none"
        >
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
      </div>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RePieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 space-y-3">
        {chartData.map((item) => (
          <div key={item.name} className="flex justify-between items-center text-[11px] font-bold">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500">{item.name}</span>
            </div>
            <span className="text-slate-800">{item.value} Hari</span>
          </div>
        ))}
      </div>
    </div>
  );
}
