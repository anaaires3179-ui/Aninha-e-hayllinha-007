import React, { useState } from 'react';
import { Equipment, Reservation, Shift } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Plus, ChevronRight } from './Icons';
import { formatDateBr } from '../utils/conflictEngine';

interface ScheduleGridViewProps {
  equipments: Equipment[];
  reservations: Reservation[];
  todayDate: string;
  onBookSlot: (equipId: string, date: string, shift: Shift) => void;
}

export const ScheduleGridView: React.FC<ScheduleGridViewProps> = ({
  equipments,
  reservations,
  todayDate,
  onBookSlot
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const shifts: Shift[] = ['Manhã', 'Tarde', 'Noite'];

  const filteredEquipments = equipments.filter(
    (e) => categoryFilter === 'all' || e.category === categoryFilter
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Date Selector */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Grade Geral de Ocupação</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão matricial por data e turno escolar para localizar janelas livres de equipamentos
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-800 font-semibold"
            />
          </div>

          <button
            onClick={() => setSelectedDate(todayDate)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Categories filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Todos os Recursos' },
          { id: 'chromebooks', label: 'Chromebooks' },
          { id: 'tvs', label: 'TVs & Displays' },
          { id: 'projecao', label: 'Projeção & Som' },
          { id: 'cabos', label: 'Cabos & Kits' }
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition ${
              categoryFilter === c.id
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4 w-72">Equipamento / Recurso</th>
                {shifts.map((s) => (
                  <th key={s} className="p-4 text-center border-l border-slate-200">
                    <span className="block text-slate-900">{s}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {s === 'Manhã' ? '08:00 - 11:45' : s === 'Tarde' ? '13:30 - 17:15' : '19:00 - 22:15'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEquipments.map((equip) => (
                <tr key={equip.id} className="hover:bg-slate-50/40 transition">
                  <td className="p-4 align-top">
                    <div className="font-bold text-slate-900 text-sm">{equip.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]">
                        {equip.tag}
                      </span>
                      <span>{equip.location}</span>
                    </div>
                  </td>

                  {shifts.map((shift) => {
                    const booking = reservations.find(
                      (r) =>
                        r.equipmentId === equip.id &&
                        r.date === selectedDate &&
                        r.shift === shift &&
                        (r.status === 'approved' || r.status === 'in_use' || r.status === 'picked_up')
                    );

                    return (
                      <td
                        key={shift}
                        className="p-3 border-l border-slate-100 align-middle text-center w-56"
                      >
                        {booking ? (
                          <div className="bg-blue-50/90 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-left space-y-1 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-blue-800 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Ocupado
                              </span>
                              <span className="text-[10px] text-blue-600 font-mono">{booking.id}</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-xs truncate">
                              {booking.professor}
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium">
                              📍 {booking.room}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-emerald-200/90 bg-emerald-50/30 group">
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Livre
                            </span>
                            <button
                              onClick={() => onBookSlot(equip.id, selectedDate, shift)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-white border border-blue-200 px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Reservar</span>
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
    </div>
  );
};
