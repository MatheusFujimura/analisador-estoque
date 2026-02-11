
import * as XLSX from 'xlsx';
import { MaterialData } from '../types';

export const parseExcelFile = async (file: File): Promise<MaterialData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames.includes('Tabela1') 
          ? 'Tabela1' 
          : workbook.SheetNames[0];
          
        const worksheet = workbook.Sheets[sheetName];
        // Header: 1 garante que recebemos um array de arrays (linhas e colunas por índice)
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Pulamos a primeira linha (cabeçalho)
        const dataRows = rows.slice(1);

        const mappedData: MaterialData[] = dataRows
          .filter(row => row[0]) // Garante que a Coluna A (Código) exista
          .map((row, index) => {
            const codigo = String(row[0] || '').trim();
            const descricao = String(row[1] || '').trim();
            const unidadeMedida = String(row[2] || '').trim();
            const pontoMinimo = Number(row[4] || 0);    // Coluna E (Index 4)
            const pontoMaximo = Number(row[5] || 0);    // Coluna F (Index 5)
            const saldoLivre = Number(row[6] || 0);     // Coluna G (Index 6)
            const consumo30Dias = Number(row[7] || 0);  // Coluna H (Index 7)
            
            const tipoRecomendacao = String(row[11] || '').trim(); // Coluna L (Index 11)
            const valorSugeridoMin = Number(row[9] || 0);          // Coluna J (Index 9)
            const valorSugeridoMax = Number(row[13] || 0);         // Coluna N (Index 13)
            const pedidosAbertos = Number(row[17] || 0);           // Coluna R (Index 17)

            // Lógica exata solicitada:
            // Se Coluna L == "Comprar mín." -> Usa J
            // Se Coluna L == "Comprar máx." -> Usa N
            let baseSugerida = 0;
            const tipoLower = tipoRecomendacao.toLowerCase();
            if (tipoLower.includes('mín') || tipoLower.includes('min')) {
              baseSugerida = valorSugeridoMin;
            } else if (tipoLower.includes('máx') || tipoLower.includes('max')) {
              baseSugerida = valorSugeridoMax;
            } else {
              // Fallback caso a coluna L esteja vazia mas haja valores nas outras
              baseSugerida = valorSugeridoMin > 0 ? valorSugeridoMin : valorSugeridoMax;
            }

            // Subtrai pedidos em aberto (Coluna R) do valor sugerido
            const valorFinalPlanilha = Math.max(0, baseSugerida - pedidosAbertos);

            return {
              id: `${codigo}-${index}`,
              codigo,
              descricao,
              unidadeMedida,
              pontoMinimo,
              pontoMaximo,
              saldoLivre,
              consumo30Dias,
              tipoRecomendacaoPlanilha: tipoRecomendacao || "Não informado",
              valorSugeridoMin,
              valorSugeridoMax,
              pedidosAbertos,
              valorFinalPlanilha
            };
          });

        resolve(mappedData);
      } catch (err) {
        console.error("Erro no Excel Service:", err);
        reject(new Error('Erro ao ler Colunas A-R. Verifique se a planilha segue o padrão (A:Cód, J:Min, L:Tipo, N:Max, R:Pedidos).'));
      }
    };
    reader.onerror = () => reject(new Error('Erro físico na leitura do arquivo.'));
    reader.readAsArrayBuffer(file);
  });
};
