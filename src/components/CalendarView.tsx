import React, { useState } from 'react';
import { Equipment, Reservation, Shift, ResourceType } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Layers,
  Laptop,
  BookOpen,
  Filter
} from './Icons';
import { formatDateBr } from '../utils/conflictEngine';

interface CalendarViewProps {
  equipments: Equipment[];
  reservations: Reservation[];
  todayDate: string;
  onBookSlot: (equipId: string, date: string, shift: Shift) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  equipments,
  reservations,
  todayDate,
  onBookSlot
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'all' | ResourceType>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  const shifts: Shift[] = ['Manhã', 'Tarde', 'Noite'];

  // Days of the active week (Monday to Friday)
  const weekDays = React.useMemo(() => {
    const base = new Date(selectedDate);
    const dayOfWeek = base.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const days: { dateStr: string; label: string; dayNum: number; isToday: boolean }[] = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + mondayOffset + i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        dateStr: iso,
        label: dayNames[i],
        dayNum: d.getDate(),
        isToday: iso === todayDate
      });
    }
    return days;
  }, [selectedDate, todayDate]);

  const filteredEquipments = equipments.filter((e) => {
    if (resourceTypeFilter !== 'all' && e.resourceType !== resourceTypeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'approved':
      case 'in_use':
      case 'picked_up':
        return { label: 'Reservado', bg: 'bg-blue-600 text-white', dot: 'bg-blue-300' };
      case 'pending':
        return { label: 'Aguardando', bg: 'bg-amber-500 text-white', dot: 'bg-amber-200' };
      case 'returned':
        return { label: 'Devolvido', bg: 'bg-slate-400 text-white', dot: 'bg-slate-200' };
      case 'rejected':
      case 'cancelled':
        return { label: 'Cancelado', bg: 'bg-red-400 text-white', dot: 'bg-red-200' };
      default:
        return { label: 'Ocupado', bg: 'bg-blue-600 text-white', dot: 'bg-blue-300' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. CALENDAR HEADER & CONTROLS */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Calendário Geral de Ocupação & Programação
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte a grade semanal e mensal de reservas para identificar janelas livres e planejar aulas com antecedência.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                viewMode === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Diária
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                viewMode === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Mensal
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50 font-bold"
            />
            <button
              onClick={() => setSelectedDate(todayDate)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Hoje
            </button>
          </div>
        </div>
      </div>

      {/* 2. COLOR CODE LEGEND (CONFORME REQUISITO 5) */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Legenda de Cores Oficial:
        </span>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verde: Disponível / Livre
          </span>
          <span className="flex items-center gap-1.5 font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Azul: Reservado / Confirmado
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Amarelo: Aguardando Aprovação
          </span>
          <span className="flex items-center gap-1.5 font-medium text-red-800 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Vermelho: Em Manutenção
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Cinza: Devolvido / Inativo
          </span>
        </div>
      </div>

      {/* 3. VISUALIZAÇÃO SEMANAL (DEFAULT) */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-64 text-slate-700 font-bold uppercase tracking-wider">
                    Recurso Patrimonial
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateStr}
                      className={`p-3 text-center border-l border-slate-200 ${
                        day.isToday ? 'bg-blue-50/60 font-black text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      <span className="block font-bold">{day.label}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Dia {day.dayNum} {day.isToday && '(Hoje)'}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipments.slice(0, 8).map((equip) => (
                  <tr key={equip.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 align-top">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{equip.name}</p>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded font-semibold text-slate-600">
                          {equip.patrimonyNumber}
                        </span>
                        <span>• {equip.location}</span>
                      </div>
                    </td>

                    {weekDays.map((day) => {
                      const dayBookings = reservations.filter(
                        (r) =>
                          r.equipmentId === equip.id &&
                          r.date === day.dateStr &&
                          r.status !== 'cancelled'
                      );

                      const hasBooking = dayBookings.length > 0;

                      return (
                        <td
                          key={day.dateStr}
                          className="p-2.5 border-l border-slate-100 align-top h-24"
                        >
                          {hasBooking ? (
                            <div className="space-y-1.5">
                              {dayBookings.map((b) => {
                                const badge = getStatusBadge(b.status);
                                return (
                                  <div
                                    key={b.id}
                                    className={`p-2 rounded-xl text-[10px] shadow-xs space-y-0.5 ${
                                      b.status === 'pending'
                                        ? 'bg-amber-50 border border-amber-200 text-amber-950'
                                        : 'bg-blue-50 border border-blue-200 text-blue-950'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold truncate">{b.professor}</span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                          b.status === 'pending'
                                            ? 'bg-amber-200 text-amber-900'
                                            : 'bg-blue-600 text-white'
                                        }`}
                                      >
                                        {b.shift}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 truncate font-medium">📍 {b.room}</p>
                                    <p className="text-[9px] text-slate-400">
                                      {b.startTime} - {b.endTime}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/20 group">
                              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Livre
                              </span>
                              <button
                                onClick={() => onBookSlot(equip.id, day.dateStr, 'Manhã')}
                                className="text-[10px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-lg transition shadow-xs cursor-pointer opacity-80 group-hover:opacity-100"
                              >
                                + Reservar
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VISUALIZAÇÃO DIÁRIA (POR TURNO DETALHADO) */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              Agenda do Dia: {formatDateBr(selectedDate)}
            </h3>
            <span className="text-xs text-slate-500">Horários de Aula por Turno</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map((shiftName) => {
              const shiftBookings = reservations.filter(
                (r) =>
                  r.date === selectedDate &&
                  r.shift === shiftName &&
                  r.status !== 'cancelled'
              );

              return (
                <div key={shiftName} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-800 text-sm">{shiftName}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {shiftName === 'Manhã' ? '07:30 - 11:45' : shiftName === 'Tarde' ? '13:15 - 17:30' : '19:00 - 22:30'}
                    </span>
                  </div>

                  {shiftBookings.length === 0 ? (
                    <div className="py-8 text-center text-xs text-emerald-700 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                      <p className="font-bold">Turno Totalmente Liberado</p>
                      <p className="text-[11px] text-slate-400">Nenhum equipamento alocado nesta faixa.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shiftBookings.map((b) => (
                        <div key={b.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">{b.equipmentName}</span>
                            <span className="font-mono text-[9px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded font-bold">
                              {b.id}
                            </span>
                          </div>
                          <p className="text-slate-600">Docente: <strong>{b.professor}</strong> ({b.turma})</p>
                          <p className="text-blue-700 font-semibold text-[11px]">📍 {b.room}</p>
                          <p className="text-[10px] text-slate-400 italic">"{b.pedagogicalPurpose}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. VISUALIZAÇÃO MENSAL (GRID DE DIAS) */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              Visão Mensal da Programação Escolar
            </h3>
            <span className="text-xs text-slate-500">Mês Corrente</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
              const count = reservations.filter(
                (r) => r.date === dateStr && r.status !== 'cancelled'
              ).length;
              const isToday = dateStr === todayDate;

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('daily');
                  }}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex flex-col justify-between h-20 ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-black ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                        Hoje
                      </span>
                    )}
                  </div>

                  {count > 0 ? (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md self-start">
                      {count} reserva(s)
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-semibold self-start">
                      Livre
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
