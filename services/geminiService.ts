
import { GoogleGenAI, Type } from "@google/genai";
import { TravelEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTravelData = async (data: TravelEntry[]): Promise<any> => {
  if (data.length === 0) return null;

  const dataSummary = data.map(d => 
    `จังหวัด: ${d.province}, เดือน: ${d.travelMonth}, นาน: ${d.duration} วัน, อายุ: ${d.age}, เพศ: ${d.gender}, ความชอบ: ${d.destinationType}, สถานที่: ${d.location}, งบประมาณ: ${d.budget}, ความถี่ต่อปี: ${d.frequency}`
  ).join('\n');

  const prompt = `
    จงวิเคราะห์ข้อมูลแบบสำรวจการท่องเที่ยวต่อไปนี้ และสรุปเป็นรายงานการตลาดการท่องเที่ยวในประเทศไทยระดับมืออาชีพ
    ระบุรูปแบบความสัมพันธ์ระหว่าง จังหวัดที่นิยม ช่วงเวลา(เดือน) และระยะเวลาการเดินทาง
    แนะนำกลยุทธ์การตลาดที่เหมาะสมตามฤดูกาลและพฤติกรรมผู้บริโภค
    
    ข้อมูล:
    ${dataSummary}

    ข้อกำหนด: ผลลัพธ์ต้องเป็นภาษาไทยทั้งหมด (สรุป, แนวโน้ม, คำแนะนำ)
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
            summary: { type: Type.STRING, description: "สรุปภาพรวมการวิเคราะห์" },
            trends: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "รายการแนวโน้มที่น่าสนใจ"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "คำแนะนำสำหรับธุรกิจท่องเที่ยว"
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
