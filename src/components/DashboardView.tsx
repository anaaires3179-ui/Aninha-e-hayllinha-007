import React from 'react';
import { Equipment, Reservation, UserProfile, AppNotification, BookingModalType } from '../types';
import { 
  Calendar, 
  Laptop, 
  Bot, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Tv, 
  Volume2, 
  ChevronRight, 
  MapPin,
  Sparkles,
  ShieldCheck,
  Microscope,
  BookOpen,
  Box,
  Layers,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus
} from './Icons';
import { formatDateBr } from '../utils/conflictEngine';

interface DashboardViewProps {
  equipments: Equipment[];
  reservations: Reservation[];
  currentUser: UserProfile;
  todayDate: string;
  notifications: AppNotification[];
  onNavigate: (tab: string) => void;
  onStartBookingMode: (mode: BookingModalType, targetId?: string) => void;
  onOpenBot: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  equipments,
  reservations,
  currentUser,
  todayDate,
  notifications,
  onNavigate,
  onStartBookingMode,
  onOpenBot
}) => {
  // Today's active reservations
  const allTodayReservations = reservations.filter(
    (r) => r.date === todayDate && (r.status === 'approved' || r.status === 'in_use' || r.status === 'picked_up')
  );

  // Current user's reservations today
  const myTodayReservations = allTodayReservations.filter(
    (r) => r.professor.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || 'ana') ||
           r.functionalId === currentUser.functionalId
  );

  // Statistics
  const totalEquipments = equipments.length;
  const availableCount = equipments.filter((e) => e.status === 'available').length;
  const reservedCount = allTodayReservations.length;
  const maintenanceCount = equipments.filter((e) => e.status === 'maintenance').length;
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;

  // Upcoming future reservations
  const upcomingReservations = reservations.filter(
    (r) => r.date >= todayDate && r.status === 'approved'
  ).slice(0, 5);

  // Greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 1. WELCOME & TODAY SUMMARY HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-96 h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:18px_18px] opacity-15 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {getGreeting()}, {currentUser.name}! • {formatDateBr(todayDate)}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Gestão Integrada de Recursos Multimídia & Materiais Pedagógicos
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consulte a disponibilidade em tempo real, reserve equipamentos tecnológicos e materiais de apoio didático com prevenção de choques de horário.
            </p>

            {myTodayReservations.length > 0 ? (
              <div className="pt-2">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Você possui {myTodayReservations.length} recurso(s) agendado(s) para hoje:
                </p>
                <div className="mt-1 space-y-1">
                  {myTodayReservations.map((r) => (
                    <div key={r.id} className="text-xs text-slate-200 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {r.equipmentName}
                      </span>
                      <span className="text-blue-300">📍 {r.room}</span>
                      <span className="text-slate-400">
                        • Turno {r.shift} ({r.startTime} às {r.endTime})
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">[{r.id}]</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 pt-1">
                Nenhum equipamento em seu nome agendado para o dia de hoje. Recursos totalmente liberados.
              </p>
            )}
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('booking')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>

            <button
              onClick={onOpenBot}
              className="inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-5 py-3 rounded-2xl text-xs sm:text-sm border border-slate-700 transition cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Agendar via TechBot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS COUNTERS: DISPONÍVEIS, RESERVADOS, EM MANUTENÇÃO, PENDENTES */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Acervo</p>
            <p className="text-2xl font-black text-slate-900">{totalEquipments}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Tecnológicos + Didáticos</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disponíveis Hoje</p>
            <p className="text-2xl font-black text-slate-900">{availableCount}</p>
            <p className="text-[10px] text-slate-500">Prontos p/ retirada</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reservados Hoje</p>
            <p className="text-2xl font-black text-slate-900">{reservedCount}</p>
            <p className="text-[10px] text-indigo-600 font-bold">Ocupação da escola</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
            <p className="text-[10px] text-amber-700 font-bold">Aguardando coordenação</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Em Manutenção</p>
            <p className="text-2xl font-black text-slate-900">{maintenanceCount}</p>
            <p className="text-[10px] text-red-600 font-bold">Reparo preventivo</p>
          </div>
        </div>
      </div>

      {/* 3. SETE MODALIDADES DE AGENDAMENTO (OPÇÕES 1 A 7 DO PROMPT) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Modalidades Rápidas de Agendamento</h3>
            <p className="text-xs text-slate-500">Escolha o ponto de partida que melhor atende à sua necessidade pedagógica</p>
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            7 Opções de Fluxo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Opção 1 */}
          <div
            onClick={() => onStartBookingMode('individual')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Por Equipamento Específico</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Selecione diretamente o aparelho (ex: Datashow Epson 01, Smart TV 55", Chromebooks).
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Escolher item &rarr;
            </span>
          </div>

          {/* Opção 2 */}
          <div
            onClick={() => onStartBookingMode('category')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Por Categoria de Recurso</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Filtre por Informática, Áudio, Vídeo ou Materiais de Matemática e Ciências.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ver categorias &rarr;
            </span>
          </div>

          {/* Opção 3 */}
          <div
            onClick={() => onStartBookingMode('datetime')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Por Data & Horário</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Escolha primeiro o dia e o turno da aula para descobrir tudo o que está livre.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Buscar horários &rarr;
            </span>
          </div>

          {/* Opção 4 */}
          <div
            onClick={() => onStartBookingMode('turma')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Por Turma Escolar</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Vincule o agendamento ao 6º EF, 9º EF ou 3º EM registrando a finalidade da aula.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Selecionar turma &rarr;
            </span>
          </div>

          {/* Opção 5 */}
          <div
            onClick={() => onStartBookingMode('room')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                5
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Por Sala ou Espaço</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Reserve para o Laboratório de Ciências, Informática, Auditório ou Biblioteca.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Escolher sala &rarr;
            </span>
          </div>

          {/* Opção 6 */}
          <div
            onClick={() => onStartBookingMode('recurrent')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                6
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Agendamento Recorrente</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Reserve para várias semanas (ex: toda terça e quinta-feira para projetos).
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Solicitar período &rarr;
            </span>
          </div>

          {/* Opção 7 */}
          <div
            onClick={() => onNavigate('kits')}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200 hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between col-span-1 sm:col-span-2"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                7
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Kits Multimídia Prontos</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Reserve pacotes completos com 1 clique: Datashow + Notebook + Caixa de Som + Cabos HDMI e Extensão.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explorar kits completos &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* 4. QUADRO DE AVISOS, DEVOLUÇÕES & PROGRAMAÇÃO SEMANAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avisos Institucionais & Notificações de Devolução */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Mural de Avisos & Devoluções
            </h3>
            <span className="text-[10px] text-slate-400">Coordenação & TI</span>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                  notif.type === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : notif.type === 'success'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{notif.title}</span>
                  <span className="text-[10px] text-slate-400">{notif.createdAt}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{notif.message}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200/60 text-xs text-blue-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Regra de Devolução Pontual
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Equipamentos devem ser conferidos e devolvidos ao almoxarifado até 15 minutos após o encerramento do turno para recarga e liberação ao próximo docente.
            </p>
          </div>
        </div>

        {/* Programação do Dia e Próximos Agendamentos */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Agendamentos de Hoje ({formatDateBr(todayDate)})</h3>
              <p className="text-xs text-slate-500">Acompanhamento dos recursos em uso na instituição</p>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              Ver Grade Semanal &rarr;
            </button>
          </div>

          {allTodayReservations.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Nenhum equipamento agendado para hoje.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {allTodayReservations.map((res) => (
                <div key={res.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] shrink-0 ${
                      res.shift === 'Manhã' ? 'bg-amber-100 text-amber-800' :
                      res.shift === 'Tarde' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {res.shift} ({res.startTime} - {res.endTime})
                    </span>

                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{res.equipmentName}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5 flex-wrap">
                        <span className="text-slate-700 font-semibold">📍 {res.room}</span>
                        <span>• Turma: <strong>{res.turma}</strong></span>
                        <span className="font-mono text-slate-400">[{res.id}]</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-slate-600 font-medium block">
                      Solicitante: <strong className="text-slate-900">{res.professor}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">{res.subject}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
