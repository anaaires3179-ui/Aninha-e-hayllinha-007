import React from 'react';
import { Reservation } from '../types';
import { X, Printer, CheckCircle2, MapPin, Calendar, Clock, User, ShieldCheck } from './Icons';
import { formatDateBr } from '../utils/conflictEngine';

interface ReceiptModalProps {
  reservation: Reservation | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ reservation, onClose }) => {
  if (!reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              ET
            </div>
            <div>
              <h3 className="font-bold text-sm">Comprovante de Reserva</h3>
              <p className="text-[11px] text-slate-400">EduTech Multimídia • SEDUC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-6 space-y-5 text-slate-800 text-xs sm:text-sm print:p-0">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Código de Controle
              </span>
              <span className="font-mono text-xl font-black text-blue-700 tracking-wider">
                {reservation.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Status
              </span>
              <span
                className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                  reservation.status === 'approved' || reservation.status === 'in_use' || reservation.status === 'picked_up'
                    ? 'bg-emerald-100 text-emerald-800'
                    : reservation.status === 'pending'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {reservation.status === 'approved' ? 'Aprovado' : reservation.status === 'pending' ? 'Pendente' : reservation.status === 'picked_up' ? 'Retirado' : reservation.status}
              </span>
            </div>
          </div>

          {/* Equipment details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Recurso Alocado
            </span>
            <p className="font-bold text-slate-900 text-base">{reservation.equipmentName}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-700">
                {reservation.patrimonyNumber}
              </span>
              <span>• Quantidade: <strong>{reservation.quantity} unidade(s)</strong></span>
            </div>
            {reservation.pedagogicalPurpose && (
              <p className="text-xs text-slate-500 italic pt-1">
                Finalidade: "{reservation.pedagogicalPurpose}"
              </p>
            )}
          </div>

          {/* Schedule & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Data do Agendamento
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{formatDateBr(reservation.date)}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Turno e Horário
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{reservation.shift} ({reservation.startTime} - {reservation.endTime})</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Sala / Local de Uso
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{reservation.room}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Docente Responsável
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span className="truncate">{reservation.professor}</span>
              </p>
            </div>
          </div>

          {/* Instructions note */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <strong className="block font-bold">Orientações de Retirada e Devolução:</strong>
            • Apresente este comprovante no balcão de T.I. com 10 minutos de antecedência.
            <br />
            • Verifique os cabos, carregadores e travas no ato da devolução para preservar os equipamentos.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ficha</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
