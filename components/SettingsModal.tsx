
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl);

  if (!isOpen) return null;

  const scriptCode = `
/**
 * ฟังก์ชันรับข้อมูลจากแอป
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // ตรวจสอบว่ามี Header หรือยัง
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "เพศ", "อายุ", "ประเภทการท่องเที่ยว", "งบประมาณ", 
        "ความถี่", "จังหวัด", "สถานที่เจาะจง", "เดือนที่เดินทาง", 
        "ระยะเวลา(วัน)", "แรงจูงใจ"
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.gender,
      data.age,
      data.destinationType,
      data.budget,
      data.frequency,
      data.province,
      data.location,
      data.travelMonth,
      data.duration,
      data.motivation
    ]);
    
    return ContentService.createTextOutput("บันทึกสำเร็จ").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * ฟังก์ชันสำหรับทดสอบลิงก์
 */
function doGet() {
  return ContentService.createTextOutput("เชื่อมต่อสำเร็จ! ลิงก์นี้พร้อมใช้งานสำหรับรับข้อมูลแล้ว").setMimeType(ContentService.MimeType.TEXT);
}
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    alert('คัดลอกโค้ดเรียบร้อยแล้ว!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">ตั้งค่า Google Sheets v2</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 shadow-sm shadow-amber-100/50">
             <div className="text-amber-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
             </div>
             <p className="text-xs text-amber-800 leading-relaxed">
                <strong>ข้อมูลสำคัญ:</strong> โค้ดมีการอัปเดตให้รองรับฟิลด์ใหม่ (จังหวัด, เดือน, จำนวนวัน) กรุณานำโค้ดนี้ไปเปลี่ยนใน Apps Script ของคุณเพื่อการเก็บข้อมูลที่ครบถ้วน
             </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Web App URL (จากขั้นตอนการ Deploy)</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">อัปเดตโค้ด Apps Script</label>
              <button onClick={handleCopy} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                 </svg>
                 คัดลอกใหม่
              </button>
            </div>
            <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl text-[10px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
              {scriptCode}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => onSave(url)}
            className="flex-1 bg-blue-600 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            บันทึกและเชื่อมต่อ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
