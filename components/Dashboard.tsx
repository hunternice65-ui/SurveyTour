
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { TravelEntry } from '../types';

interface DashboardProps {
  data: TravelEntry[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // 1. Province Popularity
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

  // 2. Monthly Trends
  const monthData = useMemo(() => {
    const months = ['มก.', 'กพ.', 'มีค.', 'เมย.', 'พค.', 'มิย.', 'กค.', 'สค.', 'กย.', 'ตค.', 'พย.', 'ธค.'];
    const monthFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const counts: Record<string, number> = {};
    monthFull.forEach(m => counts[m] = 0);
    data.forEach(d => {
      counts[d.travelMonth] = (counts[d.travelMonth] || 0) + 1;
    });
    return monthFull.map((m, i) => ({ name: months[i], full: m, value: counts[m] }));
  }, [data]);

  // 3. Destination Types Distribution
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      counts[d.destinationType] = (counts[d.destinationType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // 4. Budget Stats
  const budgetStats = useMemo(() => {
    if (data.length === 0) return { avg: 0, total: 0, max: 0 };
    const total = data.reduce((acc, curr) => acc + curr.budget, 0);
    const max = Math.max(...data.map(d => d.budget));
    return {
      avg: Math.round(total / data.length),
      total,
      max
    };
  }, [data]);

  // 5. Generated Insights (Pure JS Logic)
  const autoInsights = useMemo(() => {
    if (data.length === 0) return [];
    
    const insights = [];
    
    // Top Month
    const topMonth = [...monthData].sort((a, b) => b.value - a.value)[0];
    if (topMonth.value > 0) {
      insights.push(`ช่วงเวลาที่ได้รับความนิยมสูงสุดคือเดือน ${topMonth.full}`);
    }

    // Top Motivation
    const motivations: Record<string, number> = {};
    data.forEach(d => motivations[d.motivation] = (motivations[d.motivation] || 0) + 1);
    const topMotivation = Object.entries(motivations).sort((a, b) => b[1] - a[1])[0];
    if (topMotivation) {
      insights.push(`แรงจูงใจหลักในการเดินทางคือเพื่อ "${topMotivation[0]}"`);
    }

    // High Spenders
    const highBudgetCount = data.filter(d => d.budget >= 25000).length;
    if (highBudgetCount > 0) {
      const percentage = Math.round((highBudgetCount / data.length) * 100);
      insights.push(`มีกลุ่มนักท่องเที่ยวระดับ High-end (งบ 25,000+) ประมาณ ${percentage}% ของข้อมูลทั้งหมด`);
    }

    return insights;
  }, [data, monthData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">กลุ่มตัวอย่าง</p>
          <p className="text-3xl font-black text-slate-800">{data.length}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">บันทึกทั้งหมด</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">งบเฉลี่ย/ทริป</p>
          <p className="text-3xl font-black text-blue-600 truncate">฿{budgetStats.avg.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">ต่อการเดินทาง 1 ครั้ง</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">จังหวัดยอดฮิต</p>
          <p className="text-3xl font-black text-indigo-600 truncate">{provinceData[0]?.name || '-'}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">อันดับ 1 ในฐานข้อมูล</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">งบสูงสุดที่บันทึก</p>
          <p className="text-3xl font-black text-emerald-600 truncate">฿{budgetStats.max.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">Max Single Budget</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analysis Summary */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Data Insights</h3>
          </div>
          
          <div className="space-y-4">
            {autoInsights.length > 0 ? autoInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 group-hover:scale-150 transition-transform"></div>
                <p className="text-sm font-bold text-slate-300 leading-relaxed">{insight}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500 italic">เพิ่มข้อมูลเพื่อเริ่มต้นการวิเคราะห์...</p>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-white/10">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Quick Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Capital Spent</span>
                <span className="text-sm font-black">฿{budgetStats.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Target Segment</span>
                <span className="text-sm font-black text-blue-400">Domestic Travelers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ความนิยมตามช่วงเวลา</h3>
            <div className="h-56">
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

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ประเภทสถานที่</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {typeData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                    <span className="text-[9px] font-bold text-slate-500">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Top 5 จังหวัดที่ได้รับความนิยม</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{fontSize: '11px', fontWeight: 'bold'}} width={80} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Bar dataKey="value" name="จำนวนคน" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
