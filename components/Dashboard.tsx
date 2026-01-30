
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { TravelEntry, InsightReport } from '../types';

interface DashboardProps {
  data: TravelEntry[];
  insights: InsightReport | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

const Dashboard: React.FC<DashboardProps> = ({ data, insights, isAnalyzing, onAnalyze }) => {
  const destinationData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      counts[d.destinationType] = (counts[d.destinationType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const provinceData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      counts[d.province] = (counts[d.province] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const monthData = useMemo(() => {
    const months = ['มก.', 'กพ.', 'มีค.', 'เมย.', 'พค.', 'มิย.', 'กค.', 'สค.', 'กย.', 'ตค.', 'พย.', 'ธค.'];
    const monthFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const counts: Record<string, number> = {};
    monthFull.forEach(m => counts[m] = 0);
    data.forEach(d => {
      counts[d.travelMonth] = (counts[d.travelMonth] || 0) + 1;
    });
    return monthFull.map((m, i) => ({ name: months[i], value: counts[m] }));
  }, [data]);

  const avgBudget = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((acc, curr) => acc + curr.budget, 0) / data.length);
  }, [data]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">กลุ่มตัวอย่าง</p>
          <p className="text-xl md:text-3xl font-black text-slate-800">{data.length} <span className="text-[10px] md:text-sm font-medium text-slate-400 uppercase">Users</span></p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">งบเฉลี่ย/ทริป</p>
          <p className="text-xl md:text-3xl font-black text-blue-600 truncate">฿{avgBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">จังหวัดยอดฮิต</p>
          <p className="text-xl md:text-3xl font-black text-indigo-600 truncate">{provinceData[0]?.name || '-'}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-white p-2 rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-100">
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing || data.length === 0}
            className="w-full h-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl md:rounded-[1.5rem] transition-all shadow-xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span className="text-xs md:text-sm">AI ANALYZE</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ความนิยมตามช่วงเวลา</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{fontSize: '9px', fontWeight: 'bold'}} interval={0} />
                <YAxis axisLine={false} tickLine={false} style={{fontSize: '9px'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Top 5 Destinations</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{fontSize: '11px', fontWeight: 'bold'}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="value" name="จำนวน" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {insights && (
          <div className="lg:col-span-2 bg-slate-900 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
             <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="md:w-2/3 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">Strategic Summary</h3>
                   </div>
                   <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                     {insights.summary}
                   </p>
                </div>
                <div className="md:w-1/3 bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 underline decoration-2 underline-offset-8">Key Recommendations</h4>
                   <ul className="space-y-4">
                      {insights.recommendations.map((r, i) => (
                        <li key={i} className="flex gap-3 text-xs md:text-sm font-bold leading-tight items-start">
                           <span className="w-5 h-5 bg-white text-slate-900 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">{i+1}</span>
                           {r}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
