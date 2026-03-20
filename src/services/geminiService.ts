import { GoogleGenAI } from "@google/genai";
import { MoodNode } from "../types";

/**
 * Obtém insights clínicos do Gemini sobre um estado de humor específico.
 * Segue as diretrizes da API do Google Gemini.
 */
export const getClinicalInsight = async (node: MoodNode): Promise<string> => {
  // Use the process.env.GEMINI_API_KEY directly for initialization as per guidelines
  if (!process.env.GEMINI_API_KEY) {
    return "Chave da API não configurada. Não é possível obter insights detalhados.";
  }

  // Create a new instance right before the call to ensure latest config
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Atue como um psiquiatra sênior e professor. 
      Forneça uma análise clínica concisa, elegante e profunda (máximo 100 palavras) sobre o estado: "${node.label}" (${node.description}).
      Foque na fenomenologia (como o paciente sente) e nos riscos clínicos.
      Não use formatação markdown complexa, apenas texto corrido.`,
    });
    
    // response.text is a getter property (not a method) in the new SDK
    return response.text || "Não foi possível gerar a descrição.";
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Erro ao obter insights da IA. Verifique a conexão.";
  }
};