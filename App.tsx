
import React, { useState, useEffect } from 'react';
import { TravelEntry, InsightReport } from './types';
import TravelForm from './components/TravelForm';
import Dashboard from './components/Dashboard';
import { analyzeTravelData } from './services/geminiService';

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwik1KYwxKwI0tBabbscOcjuFoVpaeIfG3KkpbfIP3AzpLXEirtXroP0Kt22vkGUcHd/exec";

const MOCK_INITIAL_DATA: TravelEntry[] = [
  { id: '1', timestamp: new Date().toISOString(), gender: 'หญิง', age: 24, destinationType: 'ทะเล', budget: 12000, frequency: 3, location: 'หาดป่าตอง', province: 'ภูเก็ต', travelMonth: 'ธันวาคม', duration: 3, motivation: 'พักผ่อนจากงาน' },
  { id: '2', timestamp: new Date().toISOString(), gender: 'ชาย', age: 32, destinationType: 'ภูเขา', budget: 8000, frequency: 1, location: 'ดอยอินทนนท์', province: 'เชียงใหม่', travelMonth: 'มกราคม', duration: 2, motivation: 'พักผ่อนจากงาน' },
];

const App: React.FC = () => {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'survey' | 'stats'>('survey');

  useEffect(() => {
    const saved = localStorage.getItem('travel_data');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      setEntries(MOCK_INITIAL_DATA);
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
      // Sending to hardcoded Google Sheets URL
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      alert('บันทึกสำเร็จ! ข้อมูลถูกส่งไป Google Sheets เรียบร้อย');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('บันทึกในเครื่องแล้ว แต่การเชื่อมต่อ Cloud มีปัญหา');
    }
    
    setActiveTab('stats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTravelData(entries);
      setInsights(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="hidden sm:block">
               <h1 className="text-xl font-black text-slate-800 leading-none">Travel Hub <span className="text-blue-600">Pro</span></h1>
               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">AI Insight Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 hidden md:flex">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">Cloud Connected</span>
            </div>
            <nav className="hidden md:flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
              <button onClick={() => setActiveTab('survey')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'survey' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>SURVEY</button>
              <button onClick={() => setActiveTab('stats')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'stats' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>ANALYTICS</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
        {activeTab === 'survey' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                   <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 leading-tight">Insightful<br/>Travel Data</h2>
                   <p className="text-blue-100 text-sm md:text-lg font-medium opacity-90 mb-8 leading-relaxed">
                     ร่วมสร้างฐานข้อมูลท่องเที่ยวไทยที่แม่นยำที่สุดผ่านระบบวิเคราะห์ Gemini AI
                   </p>
                   <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-white/20 px-4 py-2 md:px-6 md:py-3 rounded-2xl backdrop-blur-md border border-white/10">
                         <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-200">Total</p>
                         <p className="text-xl md:text-2xl font-black">{entries.length}</p>
                      </div>
                      <div className="bg-white/20 px-4 py-2 md:px-6 md:py-3 rounded-2xl backdrop-blur-md border border-white/10">
                         <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-200">Cloud Sync</p>
                         <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full animate-pulse bg-green-400"></span>
                           <p className="text-sm md:text-lg font-black uppercase">Active</p>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <TravelForm onSubmit={handleFormSubmit} />
            </div>
          </div>
        ) : (
          <Dashboard 
            data={entries} 
            insights={insights} 
            isAnalyzing={isAnalyzing} 
            onAnalyze={handleAnalyze} 
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200 h-16 rounded-[2rem] shadow-2xl flex items-center justify-around z-50 px-2 overflow-hidden">
        <button 
          onClick={() => setActiveTab('survey')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-2xl transition-all ${activeTab === 'survey' ? 'text-blue-600 font-black' : 'text-slate-400 font-bold'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] uppercase tracking-tighter">Survey</span>
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-2xl transition-all ${activeTab === 'stats' ? 'text-blue-600 font-black' : 'text-slate-400 font-bold'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] uppercase tracking-tighter">Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default App;
