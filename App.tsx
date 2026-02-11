
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Package,
  RefreshCw,
  ThumbsUp,
  TrendingUp,
  CalendarDays,
  Calculator
} from 'lucide-react';
import { MaterialData, AnalysisResult } from './types';
import { parseExcelFile } from './services/excelService';
import { analyzeProcurementData } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectionDays, setProjectionDays] = useState<number>(30);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = await parseExcelFile(file);
      setData(parsed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    if (data.length === 0) return;
    setAnalyzing(true);
    setError(null);
    try {
      const aiResult = await analyzeProcurementData(data, projectionDays);
      setResult(aiResult);
    } catch (err: any) {
      setError("Erro ao processar análise. Verifique sua conexão e tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'text-red-600 bg-red-100 border-red-200';
      case 'Alta': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Media': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white p-6 shadow-xl sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">ProcureSmart <span className="text-indigo-400">Calculator</span></h1>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase italic tracking-[0.2em]">Cálculo de Ressuprimento Normatizado</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <label className="text-[10px] font-black uppercase text-slate-400">Projeção (Dias):</label>
              <input 
                type="number" 
                value={projectionDays} 
                onChange={(e) => setProjectionDays(Number(e.target.value))}
                className="bg-transparent text-white font-black w-12 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
              />
            </div>

            <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer transition-all border border-slate-700 active:scale-95 text-sm font-bold">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Trocar Planilha</span>
              <input type="file" accept=".xlsx, .xlsm" className="hidden" onChange={handleFileUpload} />
            </label>
            
            {data.length > 0 && (
              <button 
                onClick={startAnalysis}
                disabled={analyzing}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 text-sm font-bold"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Calcular Compra</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
              <FileSpreadsheet className="w-6 h-6 text-indigo-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-lg font-bold mt-6 text-slate-800">Lendo Planilha...</p>
          </div>
        )}

        {data.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <Package className="w-4 h-4 text-indigo-500" />
                    Dados Base da Planilha
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] uppercase text-slate-400 bg-slate-50 font-black border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Material</th>
                        <th className="px-6 py-4 text-center">Saldo Real (G+R)</th>
                        <th className="px-6 py-4 text-center">Consumo (H)</th>
                        <th className="px-6 py-4 text-center">Est. Máximo (F)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{item.codigo}</div>
                            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[180px] uppercase tracking-tighter">{item.descricao}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="font-black text-slate-700">
                              {item.saldoLivre + item.pedidosAbertos}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Físico: {item.saldoLivre} | Ped: {item.pedidosAbertos}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-xs font-bold text-slate-600">{item.consumo30Dias} / mês</div>
                            <div className="text-[9px] font-black text-indigo-400 uppercase">Média: {(item.consumo30Dias / 30).toFixed(2)} / dia</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="font-black text-slate-500">{item.pontoMaximo}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {!result && !analyzing && (
                <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-[30px] flex items-center justify-center mb-6 rotate-3">
                    <TrendingUp className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Cálculo de Ressuprimento</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Clique em calcular para processar a quantidade de compra ideal para cobrir os próximos <strong>{projectionDays} dias</strong> de consumo, respeitando o teto do estoque máximo.
                  </p>
                  <button onClick={startAnalysis} className="px-8 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                    Calcular Agora
                  </button>
                </div>
              )}

              {analyzing && (
                <div className="bg-slate-900 p-10 rounded-3xl flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-[loading_2s_infinite]"></div>
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-6" />
                  <h3 className="text-white text-lg font-black uppercase tracking-widest mb-2">Processando Projeção</h3>
                  <p className="text-slate-400 text-xs">Calculando demanda para os próximos {projectionDays} dias...</p>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl shadow-lg shadow-indigo-200/40 text-white">
                    <h3 className="font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      Parecer de Compra
                    </h3>
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                      {result.summary}
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className={`p-5 rounded-3xl border-2 transition-all flex flex-col gap-3 ${rec.podeComprar ? 'border-emerald-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                        <div className="flex justify-between items-start">
                          <div className="max-w-[65%]">
                            <div className="font-black text-slate-900 text-lg leading-tight">{rec.codigo}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">
                              {data.find(d => d.codigo === rec.codigo)?.descricao}
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-xl flex items-center gap-2 border ${rec.podeComprar ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-200 border-slate-300 text-slate-600'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {rec.podeComprar ? 'COMPRAR' : 'ESTOQUE OK'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2 border-y border-slate-50">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sugestão de Compra</span>
                            <div className={`text-3xl font-black ${rec.podeComprar ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {rec.quantidadeSugerida}
                              <span className="text-xs font-bold ml-1 text-slate-300 uppercase">
                                {data.find(d => d.codigo === rec.codigo)?.unidadeMedida}
                              </span>
                            </div>
                          </div>
                          {rec.podeComprar && (
                            <div className="text-right">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Urgência</span>
                              <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${getPriorityColor(rec.prioridade)}`}>
                                {rec.prioridade}
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 leading-tight font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {rec.justificativa}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={startAnalysis}
                    className="w-full py-4 bg-white border-2 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 font-black text-xs uppercase tracking-widest rounded-3xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recalcular Projeção
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!data.length && !loading && (
          <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl border border-slate-100 flex items-center justify-center rotate-6 scale-110">
                <FileSpreadsheet className="w-16 h-16 text-indigo-500" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-600 rounded-3xl shadow-xl flex items-center justify-center -rotate-12">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Ressuprimento <span className="text-indigo-600">Automatizado</span></h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                Calcule a compra ideal baseada em projeção de consumo real. Considera estoque físico, pedidos pendentes e teto máximo de estoque.
              </p>
            </div>
            <label className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-[30px] cursor-pointer transition-all shadow-2xl active:scale-95 group">
              <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Importar Tabela1</span>
              <input type="file" accept=".xlsx, .xlsm" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default App;
