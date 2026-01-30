
import React, { useState, useEffect } from 'react';
import { TravelEntry, Gender, DestinationType } from '../types';

interface TravelFormProps {
  onSubmit: (entry: Omit<TravelEntry, 'id' | 'timestamp'>) => void;
}

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const AGE_RANGES = ['15-20', '21-25', '26-30', '31-35', '36-40', '41-45', '46-50', '51-60', '60+'];
const DURATIONS = ['1 วัน (เช้าไป-เย็นกลับ)', '2 วัน 1 คืน', '3 วัน 2 คืน', '4 วัน 3 คืน', '5-7 วัน', 'มากกว่า 1 สัปดาห์'];
const MOTIVATIONS = ['พักผ่อนจากงาน', 'พาครอบครัวเที่ยว', 'ตามรอยรีวิว/โซเชียล', 'ถ่ายรูปสวยๆ', 'หาของอร่อยกิน', 'ไหว้พระแสวงบุญ', 'ทำกิจกรรมแอดเวนเจอร์'];

const LOCATIONS_MAP: Record<string, string[]> = {
  "กรุงเทพมหานคร": ["วัดพระแก้ว", "เยาวราช", "ตลาดนัดจตุจักร", "ห้างสรรพสินค้าสยาม", "เอเชียทีค", "วัดอรุณราชวราราม"],
  "เชียงใหม่": ["ดอยอินทนนท์", "วัดพระธาตุดอยสุเทพ", "ถนนคนเดินวัวลาย", "ม่อนแจ่ม", "นิมมานเหมินท์", "แม่กำปอง"],
  "ภูเก็ต": ["หาดป่าตอง", "แหลมพรหมเทพ", "ย่านเมืองเก่าภูเก็ต", "วัดฉลอง", "เกาะราชา", "หาดกะตะ"],
  "กระบี่": ["อ่าวนาง", "เกาะพีพี", "ทะเลแหวก", "สระมรกต", "เกาะห้อง", "ไร่เลย์"],
  "ชลบุรี": ["หาดพัทยา", "เกาะล้าน", "สวนนงนุช", "ปราสาทสัจธรรม", "เขาสามมุข", "สวนสัตว์เปิดเขาเขียว"],
  "ประจวบคีรีขันธ์": ["หาดหัวหิน", "ตลาดโต้รุ่งหัวหิน", "อุทยานแห่งชาติเขาสามร้อยยอด", "น้ำตกป่าละอู", "วัดห้วยมงคล"],
  "กาญจนบุรี": ["สะพานข้ามแม่น้ำแคว", "น้ำตกเอราวัณ", "ทางรถไฟสายมรณะ", "เขื่อนศรีนครินทร์", "สังขละบุรี"],
  "สุราษฎร์ธานี": ["เกาะสมุย", "เกาะพะงัน", "เกาะเต่า", "เขื่อนเชี่ยวหลาน (เขาสก)", "อุทยานแห่งชาติหมู่เกาะอ่างทอง"],
  "แม่ฮ่องสอน": ["ปาย", "ปางอุ๋ง", "บ้านรักไทย", "ทุ่งดอกบัวตองดอยแม่อูคอ", "ถ้ำลอด"],
  "นครราชสีมา": ["อุทยานแห่งชาติเขาใหญ่", "ฟาร์มโชคชัย", "วัดสรพงษ์", "วังน้ำเขียว", "อนุสาวรีย์ย่าโม"],
  "พระนครศรีอยุธยา": ["วัดมหาธาตุ", "วัดไชยวัฒนาราม", "ตลาดน้ำอโยธยา", "วัดพนัญเชิง", "หมู่บ้านญี่ปุ่น"],
  "ระยอง": ["เกาะเสม็ด", "หาดแม่รำพึง", "ทุ่งโปร่งทอง", "สถานแสดงพันธุ์สัตว์น้ำระยอง"],
  "ตราด": ["เกาะช้าง", "เกาะกูด", "เกาะหมาก", "เกาะหวาย"],
  "น่าน": ["ดอยเสมอดาว", "วัดภูมินทร์", "ถนนเลขพับผ้า", "บ่อเกลือ", "ปัว"]
};

const ALL_PROVINCES = Object.keys(LOCATIONS_MAP).sort();

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    gender: 'ชาย' as Gender,
    age: 25,
    destinationType: 'ทะเล' as DestinationType,
    budget: 15000,
    frequency: 2,
    location: '',
    province: 'กรุงเทพมหานคร',
    travelMonth: 'มกราคม',
    duration: 3,
    motivation: 'พักผ่อนจากงาน'
  });

  const [availableLocations, setAvailableLocations] = useState<string[]>(LOCATIONS_MAP['กรุงเทพมหานคร'] || []);

  useEffect(() => {
    const locations = LOCATIONS_MAP[formData.province] || ["สถานที่ยอดนิยม"];
    setAvailableLocations(locations);
    setFormData(prev => ({ ...prev, location: locations[0] }));
  }, [formData.province]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
           </svg>
        </div>
        <div className="min-w-0">
           <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate">Travel Survey</h2>
           <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">ข้อมูลของคุณจะถูกใช้โดย AI เพื่อวิเคราะห์แนวโน้ม</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Profile</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">เพศ</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all"
              >
                <option>ชาย</option>
                <option>หญิง</option>
                <option>อื่นๆ</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">กลุ่มอายุ</label>
              <select 
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value.split('-')[0])})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all"
              >
                {AGE_RANGES.map(r => <option key={r} value={r}>{r} ปี</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Planning</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">งบประมาณ/ทริป</label>
              <select 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all"
              >
                <option value="3000">≤ 3,000</option>
                <option value="8000">3,000 - 10,000</option>
                <option value="25000">10,000 - 50,000</option>
                <option value="70000">50,000+</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">ทริป/ปี</label>
              <select 
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: parseInt(e.target.value)})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all"
              >
                <option value="1">1 ครั้ง</option>
                <option value="3">2-4 ครั้ง</option>
                <option value="6">5-10 ครั้ง</option>
                <option value="12">10+ ครั้ง</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Destination Details</label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">จังหวัด</label>
              <select 
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
                className="w-full p-4 rounded-2xl bg-blue-50/50 border border-blue-100 focus:bg-white text-sm font-bold text-blue-900 transition-all"
              >
                {ALL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">สถานที่เจาะจง</label>
              <select 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold transition-all"
              >
                {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">ประเภท</label>
              <select 
                value={formData.destinationType}
                onChange={(e) => setFormData({...formData, destinationType: e.target.value as DestinationType})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold"
              >
                <option>ทะเล</option>
                <option>ภูเขา</option>
                <option>ในเมือง</option>
                <option>ศิลปวัฒนธรรม</option>
                <option>ผจญภัย</option>
                <option>พักผ่อนหย่อนใจ</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">ช่วงเดือน</label>
              <select 
                value={formData.travelMonth}
                onChange={(e) => setFormData({...formData, travelMonth: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">ระยะเวลา</label>
              <select 
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value.split(' ')[0]) || 1})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold"
              >
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
           <label className="text-xs font-bold text-slate-500 ml-1 uppercase">เหตุผลหลัก</label>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {MOTIVATIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({...formData, motivation: m})}
                  className={`p-3 md:p-4 rounded-2xl text-[10px] md:text-xs font-black transition-all border-2 text-center flex items-center justify-center leading-tight ${formData.motivation === m ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                >
                  {m}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
        >
           ส่งข้อมูลวิเคราะห์
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </button>
      </div>
    </form>
  );
};

export default TravelForm;
