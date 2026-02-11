
import { GoogleGenAI, Type } from "@google/genai";
import { MaterialData, AnalysisResult } from "../types";

export const analyzeProcurementData = async (data: MaterialData[], projectionDays: number): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Você é um Motor de Cálculo de Ressuprimento (MRP) de precisão. 
    Sua missão é calcular a QUANTIDADE DE COMPRA baseada RIGOROSAMENTE nas seguintes regras matemáticas:

    VARIÁVEIS DE ENTRADA (POR ITEM):
    - saldo_fisico (Coluna G / saldoLivre)
    - pedidos_em_aberto (Coluna R / pedidosAbertos)
    - consumo_30_dias (Coluna H / consumo30Dias)
    - dias_projecao: ${projectionDays}
    - estoque_maximo (Coluna F / pontoMaximo)

    LÓGICA DE CÁLCULO OBRIGATÓRIA (PASSO A PASSO):
    1. Calcule Saldo Disponível Real: saldo_livre = saldo_fisico + pedidos_em_aberto.
    2. Calcule Média Diária: media_diaria = consumo_30_dias / 30.
    3. Calcule Consumo Projetado: consumo_projetado = media_diaria * dias_projecao.
    4. Cálculo Inicial de Compra: quantidade_compra = consumo_projetado - saldo_livre. 
       * Se quantidade_compra < 0, então quantidade_compra = 0.
    5. Verificação de Limite Máximo:
       - Calcule Estoque Final Teórico: estoque_final = saldo_livre + quantidade_compra.
       - Se estoque_final > estoque_maximo, então quantidade_compra = estoque_maximo - saldo_livre.
       * Se após esse ajuste quantidade_compra < 0, então quantidade_compra = 0.
    6. Veredito: A quantidade final NUNCA pode ser negativa e NUNCA pode fazer o estoque final ultrapassar o estoque_maximo.

    REGRAS DE RESPOSTA:
    - podeComprar: true se quantidade_compra > 0.
    - quantidadeSugerida: O valor exato calculado no passo 5.
    - justificativa: Detalhe o cálculo feito (Ex: "Consumo projetado de X para Y dias vs Saldo real de Z").

    Dados para processamento:
    ${JSON.stringify(data.map(d => ({
      codigo: d.codigo,
      desc: d.descricao,
      saldo_fisico: d.saldoLivre,
      pedidos_em_aberto: d.pedidosAbertos,
      consumo_30_dias: d.consumo30Dias,
      estoque_maximo: d.pontoMaximo,
      unidade: d.unidadeMedida
    })), null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                codigo: { type: Type.STRING },
                podeComprar: { type: Type.BOOLEAN },
                quantidadeSugerida: { type: Type.NUMBER },
                prioridade: { type: Type.STRING, enum: ['Baixa', 'Media', 'Alta', 'Urgente'] },
                justificativa: { type: Type.STRING }
              },
              required: ['codigo', 'podeComprar', 'quantidadeSugerida', 'prioridade', 'justificativa']
            }
          },
          summary: { type: Type.STRING }
        },
        required: ['recommendations', 'summary']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("A IA não retornou uma resposta válida.");
  
  return JSON.parse(text.trim()) as AnalysisResult;
};
