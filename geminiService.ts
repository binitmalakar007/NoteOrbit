
import { GoogleGenAI, Type } from "@google/genai";
import { Section, FileData } from "./types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeDocument = async (file: FileData): Promise<Section[]> => {
  const ai = getGeminiClient();
  
  const prompt = `Analyze this document. Identify the logical chapters, headings, or major sections. 
  For each section, provide a title and a very brief one-sentence summary of what it covers.
  Return the output as a JSON array of objects with "title" and "summary" fields.`;

  const part = {
    inlineData: {
      mimeType: file.type,
      data: file.base64.split(',')[1] || file.base64,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [part, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ["title", "summary"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result.map((item: any, index: number) => ({
      ...item,
      id: `section-${index}`
    }));
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(parseGeminiError(error));
  }
};

export const generateSectionNotes = async (file: FileData, section: Section): Promise<string> => {
  const ai = getGeminiClient();
  
  const prompt = `You are a professional educational assistant. 
  Generate clear, concise, and structured notes for the section titled "${section.title}" from the provided document.
  
  Requirements:
  1. Use simple, easy-to-understand language.
  2. Use bullet points for key details.
  3. Highlight key concepts using bold text.
  4. Ensure it's informative but avoids unnecessary repetition.
  5. If the section contains technical data or steps, list them clearly.
  6. Return only the Markdown formatted notes.`;

  const part = {
    inlineData: {
      mimeType: file.type,
      data: file.base64.split(',')[1] || file.base64,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [part, { text: prompt }] },
    });

    return response.text || "No notes could be generated for this section.";
  } catch (error: any) {
    console.error("Gemini Note Generation Error:", error);
    throw new Error(parseGeminiError(error));
  }
};

const parseGeminiError = (error: any): string => {
  // Extract error message from various possible error formats
  const rawMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
  const status = error?.status || "";
  const code = error?.code || 0;

  // Specific check for Quota/Rate Limit (429)
  if (code === 429 || status === "RESOURCE_EXHAUSTED" || rawMessage.includes("429") || rawMessage.includes("quota")) {
    return "API Quota Exceeded: You've reached the limit for the free tier. Please wait a minute before trying again, or check your Gemini API billing settings at ai.google.dev.";
  }

  if (code === 403 || rawMessage.includes("403")) {
    return "Access Denied: Your API key does not have permission for this model. Ensure the 'gemini-3-pro-preview' model is enabled in your project.";
  }

  if (code === 404 || rawMessage.includes("404")) {
    return "Model Not Found: The requested AI model might be deprecated or unavailable in your region.";
  }

  if (rawMessage.includes("file_type") || rawMessage.includes("mimeType")) {
    return "Unsupported File: The document format is not recognized. Please use standard PDF, JPG, or PNG files.";
  }

  if (rawMessage.includes("SAFETY")) {
    return "Safety Block: The document contains content that was flagged by the AI's safety filters.";
  }

  if (rawMessage.includes("NetworkError") || rawMessage.includes("Failed to fetch")) {
    return "Network Error: Please check your internet connection and try again.";
  }

  return `System Error: ${rawMessage.length > 100 ? rawMessage.substring(0, 100) + '...' : rawMessage}`;
};
