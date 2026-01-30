
import React, { useState, useEffect } from 'react';
import { TravelEntry, InsightReport } from './types';
import TravelForm from './components/TravelForm';
import Dashboard from './components/Dashboard';
import { analyzeTravelData } from './services/geminiService';

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwik1KYwxKwI0tBabbscOcjuFoVpaeIfG3KkpbfIP3AzpLXEirtXroP0Kt22vkGUcHd/exec";

const MOCK_INITIAL_DATA: TravelEntry[] = [
  { id: '1', timestamp: new Date().toLocaleString('th-TH'), gender: 'หญิง', age: 24, destinationType: 'ทะเล', budget: 12000, frequency: 3, location: 'หาดป่าตอง', province: 'ภูเก็ต', travelMonth: 'ธันวาคม', duration: 3, motivation: 'พักผ่อนจากงาน' },
  { id: '2', timestamp: new Date().toLocaleString('th-TH'), gender: 'ชาย', age: 32, destinationType: 'ภูเขา', budget: 8000, frequency: 1, location: 'ดอยอินทนนท์', province: 'เชียงใหม่', travelMonth: 'มกราคม', duration: 2, motivation: 'พักผ่อนจากงาน' },
];

const App: React.FC = () => {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'survey' | 'stats' | 'history'>('survey');

  useEffect(() => {
    const savedEntries = localStorage.getItem('travel_data');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      setEntries(MOCK_INITIAL_DATA);
      localStorage.setItem('travel_data', JSON.stringify(MOCK_INITIAL_DATA));
    }
  }, []);

  const handleFormSubmit = async (data: Omit<TravelEntry, 'id' | 'timestamp'>) => {
    const newEntry: TravelEntry = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('th-TH')
    };
    
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('travel_data', JSON.stringify(updated));

    try {
      // Syncing with the hardcoded Google Sheets URL
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      console.log('Successfully synced with Google Sheets');
    } catch (error) {
      console.error('Sync failed:', error);
    }
    
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('travel_data', JSON.stringify(updated));
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTravelData(entries);
      setInsights(result);
      setActiveTab('stats');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-12 text-slate-900">
      {/* Header */}
      <header className="glass-effect border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-800 tracking-tight">Tourist <span className="text-blue-600">Hub</span></h1>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Smart Attraction Database</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <button onClick={() => setActiveTab('survey')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'survey' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}>เพิ่มสถานที่</button>
              <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}>ประวัติข้อมูล</button>
              <button onClick={() => setActiveTab('stats')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'stats' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}>วิเคราะห์ AI</button>
            </nav>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || entries.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                 {isAnalyzing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : (
                   <div className="flex items-center gap-2 px-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                     <span className="hidden md:inline text-xs font-black uppercase">Run AI</span>
                   </div>
                 )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {activeTab === 'survey' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all"></div>
                 <div className="relative z-10">
                   <h2 className="text-4xl font-black mb-6 leading-tight">แบ่งปัน<br/>ที่เที่ยวใหม่ๆ</h2>
                   <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
                     ข้อมูลของคุณจะถูกรวบรวมและส่งไปยัง <span className="text-blue-400 font-bold">Google Sheets</span> โดยอัตโนมัติ
                   </p>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Entries Count</p>
                          <p className="text-2xl font-black">{entries.length}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-2xl border bg-blue-500/10 border-blue-500/20">
                        <p className="text-[10px] font-bold uppercase mb-1 flex items-center gap-2 text-blue-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                          System Connected
                        </p>
                        <p className="text-[11px] text-slate-300">
                          ระบบเชื่อมต่อกับคลาวด์ดาต้าเบสแล้ว ข้อมูลจะถูกบันทึกแบบ Real-time
                        </p>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
            <div className="lg:col-span-8">
              <TravelForm onSubmit={handleFormSubmit} />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-800">History Log</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                  รายการทั้งหมด {entries.length} แห่ง
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">
                        {entry.province.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 leading-tight">{entry.location}</h4>
                        <p className="text-xs font-bold text-blue-500 uppercase">{entry.province}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ประเภท</p>
                      <p className="text-xs font-bold text-slate-700">{entry.destinationType}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">งบประมาณ</p>
                      <p className="text-xs font-bold text-slate-700">฿{entry.budget.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ช่วงเดือน</p>
                      <p className="text-xs font-bold text-slate-700">{entry.travelMonth}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ระยะเวลา</p>
                      <p className="text-xs font-bold text-slate-700">{entry.duration} วัน</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 italic">บันทึกเมื่อ {entry.timestamp}</span>
                     <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase">{entry.motivation}</span>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">ยังไม่มีข้อมูลสถานที่ท่องเที่ยว กรุณาเพิ่มที่หน้า Survey</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <Dashboard 
            data={entries} 
            insights={insights} 
            isAnalyzing={isAnalyzing} 
            onAnalyze={handleAnalyze} 
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 glass-effect border border-slate-200 h-16 rounded-[2rem] shadow-2xl flex items-center justify-around z-50 px-2">
        <button onClick={() => setActiveTab('survey')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'survey' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="text-[9px] font-black uppercase">Add</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[9px] font-black uppercase">History</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2" /></svg>
          <span className="text-[9px] font-black uppercase">Stats</span>
        </button>
      </div>
    </div>
  );
};

export default App;
