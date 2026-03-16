import { GoogleGenAI } from "@google/genai";
import { PLYearData, PLCalculations } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getPLInsights(data: (PLYearData & { calcs: PLCalculations })[]) {
  const prompt = `
    As a financial analyst, analyze the following 5-year P&L projection for a business plan.
    Provide 3-4 concise, actionable insights regarding:
    1. Revenue growth trends.
    2. Profitability and margin health.
    3. Expense management.
    4. Overall financial viability.

    Data:
    ${JSON.stringify(data, null, 2)}

    Format the response as a clear list of bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting AI insights:", error);
    return "Could not generate insights at this time.";
  }
}
