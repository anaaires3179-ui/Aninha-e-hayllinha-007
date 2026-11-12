import React, { useState, useMemo } from 'react';
import { Reservation, UserProfile } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  FileText, 
  Search, 
  Plus, 
  Printer,
  AlertTriangle,
  RotateCcw,
  Check,
  Edit3
} from './Icons';
import { formatDateBr } from '../utils/conflictEngine';

interface MyReservationsViewProps {
  reservations: Reservation[];
  currentUser: UserProfile;
  todayDate: string;
  onCancelReservation: (resId: string) => void;
  onNavigateToBooking: () => void;
  onViewReceipt: (reservation: Reservation) => void;
  onReportIssue: (reservation: Reservation) => void;
  onRequestDateChange: (reservation: Reservation) => void;
}

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({
  reservations,
  currentUser,
  todayDate,
  onCancelReservation,
  onNavigateToBooking,
  onViewReceipt,
  onReportIssue,
  onRequestDateChange
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Filter reservations associated with the current user or overall
  const userReservations = reservations.filter(
    (r) =>
      r.functionalId === currentUser.functionalId ||
      r.professor.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || 'ana') ||
      currentUser.role === 'admin' ||
      currentUser.role === 'coordenador'
  );

  const filteredReservations = useMemo(() => {
    return userReservations.filter((res) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'today' && res.date !== todayDate) return false;
        if (statusFilter !== 'today' && res.status !== statusFilter) return false;
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        res.equipmentName.toLowerCase().includes(q) ||
        res.room.toLowerCase().includes(q) ||
        res.professor.toLowerCase().includes(q) ||
        res.turma.toLowerCase().includes(q) ||
        res.id.toLowerCase().includes(q)
      );
    });
  }, [userReservations, statusFilter, searchQuery, todayDate]);

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'approved':
        return { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'pending':
        return { label: 'Aguardando Aprovação', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'picked_up':
        return { label: 'Retirado no Almoxarifado', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'in_use':
        return { label: 'Em Utilização', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'returned':
        return { label: 'Devolvido com Sucesso', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'rejected':
        return { label: 'Recusado', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER SECTION */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Painel do Usuário
            </span>
            <span className="text-xs text-slate-400">• {currentUser.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Minhas Reservas & Histórico Escolar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o status de aprovação, solicite prorrogações ou alterações e emita termos de retirada.
          </p>
        </div>

        <button
          onClick={onNavigateToBooking}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* 2. FILTER TABS & SEARCH */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'today', label: 'Hoje' },
            { id: 'approved', label: 'Aprovadas' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'in_use', label: 'Em Uso' },
            { id: 'returned', label: 'Devolvidas' },
            { id: 'cancelled', label: 'Canceladas' }
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            const count =
              tab.id === 'all'
                ? userReservations.length
                : tab.id === 'today'
                ? userReservations.filter((r) => r.date === todayDate).length
                : userReservations.filter((r) => r.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por código, turma ou item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* 3. LIST OF RESERVATION CARDS */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800">Nenhum agendamento encontrado</p>
          <p className="text-xs text-slate-500">
            Você não possui reservas nesta categoria ou filtro.
          </p>
          <button
            onClick={onNavigateToBooking}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            Fazer um agendamento agora &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => {
            const badge = getStatusBadge(res.status);
            const isToday = res.date === todayDate;
            const canCancel = res.status === 'approved' || res.status === 'pending';

            return (
              <div
                key={res.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  res.status === 'cancelled'
                    ? 'opacity-60 bg-slate-50/60 border-slate-200'
                    : isToday
                    ? 'border-blue-400 ring-2 ring-blue-500/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5 max-w-2xl">
                  {/* Status header */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      {res.id}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>

                    {isToday && res.status !== 'cancelled' && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Agendado para Hoje
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      Patrimônio: {res.patrimonyNumber}
                    </span>
                  </div>

                  {/* Title & Quantidade */}
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {res.equipmentName}{' '}
                    {res.quantity > 1 && (
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {res.quantity} unidades
                      </span>
                    )}
                  </h3>

                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formatDateBr(res.date)}</span>
                      {res.isRecurrent && res.endDate && (
                        <span className="text-[10px] text-amber-700">
                          (Recorrente até {formatDateBr(res.endDate)})
                        </span>
                      )}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Turno <strong>{res.shift}</strong> ({res.startTime} às {res.endTime})
                      </span>
                    </span>

                    <span className="flex items-center gap-1 text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{res.room}</span>
                    </span>

                    <span className="text-slate-700">
                      Turma: <strong>{res.turma}</strong>
                    </span>

                    <span className="text-slate-500">
                      Docente: <strong>{res.professor}</strong>
                    </span>
                  </div>

                  {/* Finalidade Pedagógica */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-800">Finalidade Pedagógica:</strong> {res.pedagogicalPurpose}
                  </p>

                  {/* Acessórios extras solicitados */}
                  {res.neededAccessories && res.neededAccessories.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px] text-slate-500">
                      <span>Acessórios:</span>
                      {res.neededAccessories.map((acc, i) => (
                        <span key={i} className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">
                          + {acc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Danos ou avisos reportados */}
                  {res.damagedReported && (
                    <div className="text-xs text-red-800 bg-red-50 p-2 rounded-xl border border-red-200">
                      <strong>Problema Reportado:</strong> {res.damagedReported}
                    </div>
                  )}
                </div>

                {/* Actions per card */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => onViewReceipt(res)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ficha / Comprovante</span>
                  </button>

                  <button
                    onClick={() => onRequestDateChange(res)}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alterar Data</span>
                  </button>

                  <button
                    onClick={() => onReportIssue(res)}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-800 hover:text-amber-900 border border-amber-200 bg-amber-50 hover:bg-amber-100/70 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Informar Defeito</span>
                  </button>

                  {canCancel && (
                    <button
                      onClick={() => setConfirmCancelId(res.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/80 px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION MODAL FOR CANCELLATION */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">Cancelar este Agendamento?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                O recurso será imediatamente devolvido ao catálogo e o horário ficará livre para outro docente da escola.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onCancelReservation(confirmCancelId);
                  setConfirmCancelId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow"
              >
                Confirmar Cancelamento
              </button>
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
