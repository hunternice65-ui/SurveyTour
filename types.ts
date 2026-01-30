
export type Gender = 'ชาย' | 'หญิง' | 'อื่นๆ' | 'ไม่ระบุ';

export type DestinationType = 'ทะเล' | 'ภูเขา' | 'ในเมือง' | 'ศิลปวัฒนธรรม' | 'ผจญภัย' | 'พักผ่อนหย่อนใจ';

export interface TravelEntry {
  id: string;
  timestamp: string;
  gender: Gender;
  age: number;
  destinationType: DestinationType;
  budget: number; // งบประมาณ (บาท)
  frequency: number; // ทริปต่อปี
  location: string; // สถานที่
  province: string; // จังหวัด
  travelMonth: string; // เดือนที่ไป
  duration: number; // จำนวนวัน
  motivation: string; // แรงจูงใจ
}

export interface InsightReport {
  summary: string;
  trends: string[];
  recommendations: string[];
}
