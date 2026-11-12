import React from 'react';
import { KitPreset } from '../types';
import { INITIAL_KITS } from '../data/mockData';
import { Box, PackageCheck, Clock, Check, Plus, ArrowRight } from './Icons';

interface KitsViewProps {
  onBookKit: (kit: KitPreset) => void;
}

export const KitsView: React.FC<KitsViewProps> = ({ onBookKit }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Opção 7 — Kits Multimídia Prontos
            </span>
            <span className="text-xs text-slate-400">• Pacotes Integrados</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Kits Escolares Pré-Configurados
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Economize tempo reservando conjuntos completos de recursos pedagógicos e tecnológicos com todos os cabos e acessórios inclusos.
          </p>
        </div>
      </div>

      {/* Grid de Kits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_KITS.map((kit) => (
          <div
            key={kit.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                  {kit.category}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Duração: ~{kit.defaultDurationHours}h
                </span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">{kit.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{kit.targetAudience}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                {kit.description}
              </p>

              {/* Items list */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Itens Inclusos no Pacote:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                  {kit.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onBookKit(kit)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Solicitar Este Kit Completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
