
export interface MaterialData {
  id: string;
  codigo: string; // Coluna A
  descricao: string; // Coluna B
  unidadeMedida: string; // Coluna C
  pontoMinimo: number; // Coluna E
  pontoMaximo: number; // Coluna F
  saldoLivre: number; // Coluna G
  consumo30Dias: number; // Coluna H
  tipoRecomendacaoPlanilha: string; // Coluna L
  valorSugeridoMin: number; // Coluna J
  valorSugeridoMax: number; // Coluna N
  pedidosAbertos: number; // Coluna R
  valorFinalPlanilha: number; // Lógica: (J ou N) - R
}

export interface AIRecommendation {
  codigo: string;
  podeComprar: boolean; // Decisão Sim/Não
  quantidadeSugerida: number; // Quantidade final que pode ser comprada
  prioridade: 'Baixa' | 'Media' | 'Alta' | 'Urgente';
  justificativa: string;
}

export interface AnalysisResult {
  recommendations: AIRecommendation[];
  summary: string;
}
