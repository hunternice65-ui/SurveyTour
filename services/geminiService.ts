
import { GoogleGenAI, Type } from "@google/genai";
import { TravelEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTravelData = async (data: TravelEntry[]): Promise<any> => {
  if (data.length === 0) return null;

  const dataSummary = data.map(d => 
    `- จังหวัด ${d.province}: ไปที่ "${d.location}" (${d.destinationType}) ช่วง ${d.travelMonth}, ระยะเวลา ${d.duration} วัน, งบประมาณ ฿${d.budget}, แรงจูงใจคือ ${d.motivation}`
  ).join('\n');

  const prompt = `
    คุณคือผู้เชี่ยวชาญด้านกลยุทธ์การท่องเที่ยวแห่งประเทศไทย (Tourism Strategist) 
    จงวิเคราะห์ข้อมูล "การสำรวจสถานที่ท่องเที่ยว" จากผู้ใช้กลุ่มตัวอย่างดังนี้:
    
    ข้อมูลดิบ:
    ${dataSummary}

    หน้าที่ของคุณ:
    1. สรุปภาพรวมความนิยมรายภาคและประเภทสถานที่ท่องเที่ยวที่โดดเด่น
    2. วิเคราะห์พฤติกรรมการใช้จ่ายเทียบกับระยะเวลาการเข้าพัก
    3. แนะนำ 3 กลยุทธ์เพื่อส่งเสริมการท่องเที่ยวในจังหวัดที่ปรากฏในข้อมูล
    4. ระบุ "เพชรในตม" (Hidden Gems) หรือจุดที่ควรพัฒนาต่อจากรายชื่อสถานที่ที่ผู้ใช้ระบุ

    ข้อกำหนด: ผลลัพธ์ต้องเป็นรูปแบบ JSON ตาม Schema ที่กำหนด และเป็นภาษาไทยทั้งหมด (ยกเว้นคำศัพท์เทคนิค)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "สรุปภาพรวมเชิงยุทธศาสตร์" },
            trends: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "รายการเทรนด์การท่องเที่ยวที่น่าจับตามอง"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "คำแนะนำสำหรับการส่งเสริมการตลาด"
            }
          },
          required: ["summary", "trends", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
