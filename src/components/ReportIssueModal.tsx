import React, { useState } from 'react';
import { Reservation } from '../types';
import { AlertTriangle, X } from './Icons';

interface ReportIssueModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onSubmitIssue: (resId: string, issueText: string) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  reservation,
  onClose,
  onSubmitIssue
}) => {
  const [issueText, setIssueText] = useState<string>('');

  if (!reservation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;
    onSubmitIssue(reservation.id, issueText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900">Informar Problema / Avaria</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Relate para a equipe técnica qualquer defeito em cabo, tela, carregador ou componente do equipamento:{' '}
          <strong>{reservation.equipmentName}</strong> ({reservation.patrimonyNumber}).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição do Problema Encontrado *</label>
            <textarea
              rows={3}
              placeholder="Ex: Cabo HDMI com mau contato; bateria do aparelho descarregando muito rápido..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow cursor-pointer"
            >
              Enviar Notificação à T.I.
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
