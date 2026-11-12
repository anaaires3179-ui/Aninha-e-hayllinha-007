import React, { useState } from 'react';
import { Equipment, Reservation, ItemCondition, ResourceType } from '../types';
import { 
  Shield, 
  Check, 
  X, 
  Plus, 
  Download, 
  Printer, 
  Clock, 
  PackageCheck, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  BarChart3, 
  Layers, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Wrench,
  RotateCcw
} from './Icons';
import { formatDateBr } from '../utils/conflictEngine';

interface AdminPanelViewProps {
  equipments: Equipment[];
  reservations: Reservation[];
  todayDate: string;
  onApproveReservation: (resId: string) => void;
  onRejectReservation: (resId: string, reason: string) => void;
  onCheckOutReservation: (resId: string) => void;
  onCheckInReservation: (resId: string, returnNotes?: string) => void;
  onAddEquipment: (newEquip: Equipment) => void;
  onUpdateEquipment: (equip: Equipment) => void;
  onDeleteEquipment: (equipId: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  equipments,
  reservations,
  todayDate,
  onApproveReservation,
  onRejectReservation,
  onCheckOutReservation,
  onCheckInReservation,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'approvals' | 'checkin_out' | 'inventory' | 'reports'>('approvals');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Add equipment modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEquipName, setNewEquipName] = useState<string>('');
  const [newEquipPatrimony, setNewEquipPatrimony] = useState<string>(`PAT-2024-${Math.floor(100 + Math.random() * 900)}`);
  const [newEquipType, setNewEquipType] = useState<ResourceType>('tecnologico');
  const [newEquipCategory, setNewEquipCategory] = useState<string>('datashow');
  const [newEquipSpecs, setNewEquipSpecs] = useState<string>('');
  const [newEquipLocation, setNewEquipLocation] = useState<string>('Depósito T.I.');
  const [newEquipCondition, setNewEquipCondition] = useState<ItemCondition>('Excelente');
  const [newEquipTotal, setNewEquipTotal] = useState<number>(1);

  // Return check-in modal
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [returnObservation, setReturnObservation] = useState<string>('');

  const pendingReservations = reservations.filter((r) => r.status === 'pending');
  const activeDeliveries = reservations.filter(
    (r) => r.status === 'approved' || r.status === 'picked_up' || r.status === 'in_use'
  );

  // Stats calculation
  const totalBookings = reservations.length;
  const approvedBookings = reservations.filter((r) => r.status === 'approved' || r.status === 'returned').length;
  const cancelledBookings = reservations.filter((r) => r.status === 'cancelled').length;
  const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  // Most used equipment calculation
  const usageCountMap: Record<string, number> = {};
  reservations.forEach((r) => {
    usageCountMap[r.equipmentName] = (usageCountMap[r.equipmentName] || 0) + 1;
  });
  const topEquipments = Object.entries(usageCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleExportCSV = () => {
    const headers = 'Código,Recurso,Patrimônio,Professor,Data,Turno,Sala,Turma,Status\n';
    const rows = reservations
      .map(
        (r) =>
          `"${r.id}","${r.equipmentName}","${r.patrimonyNumber}","${r.professor}","${r.date}","${r.shift}","${r.room}","${r.turma}","${r.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-multimidias-seduc-${todayDate}.csv`;
    a.click();
  };

  const handleCreateEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipName.trim() || !newEquipPatrimony.trim()) return;

    const newEquip: Equipment = {
      id: `item-${Date.now()}`,
      patrimonyNumber: newEquipPatrimony.trim(),
      name: newEquipName.trim(),
      resourceType: newEquipType,
      category: newEquipCategory as any,
      categoryLabel: newEquipCategory.replace('_', ' ').toUpperCase(),
      specs: newEquipSpecs.trim() || 'Equipamento escolar cadastrado no patrimônio.',
      tag: 'Geral',
      location: newEquipLocation.trim(),
      condition: newEquipCondition,
      status: 'available',
      totalQuantity: newEquipTotal,
      availableQuantity: newEquipTotal
    };

    onAddEquipment(newEquip);
    setShowAddModal(false);
    // Reset
    setNewEquipName('');
    setNewEquipSpecs('');
    setNewEquipPatrimony(`PAT-2024-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. ADMIN HEADER */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Área Administrativa Restrita
            </span>
            <span className="text-xs text-slate-400">• Gestão de Patrimônio & Almoxarifado</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Painel de Controle Institucional
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aprovação de reservas, controle de entrega/devolução física, cadastro de bens e emissão de relatórios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'approvals', label: 'Solicitações Pendentes', badge: pendingReservations.length },
          { id: 'checkin_out', label: 'Retiradas & Devoluções', badge: activeDeliveries.length },
          { id: 'inventory', label: 'Inventário & Cadastro de Bens', badge: equipments.length },
          { id: 'reports', label: 'Relatórios & Estatísticas da Coordenação' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === tab.id
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeAdminTab === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SOLICITAÇÕES PENDENTES DE APROVAÇÃO */}
      {/* ============================================================== */}
      {activeAdminTab === 'approvals' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fila de Aprovação da Coordenação</h3>
              <p className="text-xs text-slate-500">Analise a finalidade pedagógica antes de deferir o uso</p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {pendingReservations.length} solicitações aguardando
            </span>
          </div>

          {pendingReservations.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800">Todas as solicitações foram avaliadas!</p>
              <p className="text-xs text-slate-500">Nenhuma reserva pendente de moderação no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingReservations.map((res) => (
                <div key={res.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {res.id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{res.equipmentName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {res.patrimonyNumber}
                      </span>
                    </div>

                    <p className="text-slate-600">
                      Docente: <strong>{res.professor}</strong> ({res.functionalId}) • Turma: <strong>{res.turma}</strong>
                    </p>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>📅 {formatDateBr(res.date)} ({res.shift}: {res.startTime} - {res.endTime})</span>
                      <span>📍 {res.room}</span>
                    </div>

                    <p className="text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                      Finalidade: "{res.pedagogicalPurpose}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onApproveReservation(res.id)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>

                    <button
                      onClick={() => setRejectingId(res.id)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-red-200 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Recusar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CONTROLE DE RETIRADAS E DEVOLUÇÕES (CHECK-IN / CHECK-OUT) */}
      {/* ============================================================== */}
      {activeAdminTab === 'checkin_out' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Balcão de Entrega & Devolução Física</h3>
              <p className="text-xs text-slate-500">Controle de quem retirou e registro de integridade física dos aparelhos</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {activeDeliveries.map((res) => (
              <div key={res.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {res.id}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{res.equipmentName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      res.status === 'picked_up' ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {res.status === 'picked_up' ? 'Em Sala de Aula' : 'Aguardando Retirada'}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    Responsável: <strong>{res.professor}</strong> • Sala: <strong>{res.room}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Horário: {formatDateBr(res.date)} ({res.startTime} às {res.endTime}) • Patrimônio: {res.patrimonyNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {res.status === 'approved' && (
                    <button
                      onClick={() => onCheckOutReservation(res.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Registrar Retirada (Check-Out)
                    </button>
                  )}

                  {res.status === 'picked_up' && (
                    <button
                      onClick={() => {
                        setCheckingInId(res.id);
                        setReturnObservation('');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Registrar Devolução (Check-In)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: INVENTÁRIO & CADASTRO DE BENS */}
      {/* ============================================================== */}
      {activeAdminTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Livro Geral de Patrimônio Escolar</h3>
              <p className="text-xs text-slate-500">Cadastre novos bens multimídia ou materiais pedagógicos</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Bem</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3">Patrimônio</th>
                  <th className="p-3">Nome do Bem</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Localização</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Estoque Total</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipments.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-blue-700">{eq.patrimonyNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{eq.name}</td>
                    <td className="p-3 text-slate-600">{eq.categoryLabel}</td>
                    <td className="p-3 text-slate-500">{eq.location}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {eq.condition}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">
                      {eq.availableQuantity} / {eq.totalQuantity}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteEquipment(eq.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                        title="Excluir do patrimônio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: RELATÓRIOS & ESTATÍSTICAS DA COORDENAÇÃO */}
      {/* ============================================================== */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total de Reservas Registradas</span>
              <p className="text-3xl font-black text-slate-900">{totalBookings}</p>
              <p className="text-xs text-emerald-600 font-bold">{approvedBookings} concluídas com sucesso</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taxa de Cancelamentos</span>
              <p className="text-3xl font-black text-slate-900">{cancellationRate}%</p>
              <p className="text-xs text-slate-500">{cancelledBookings} canceladas no total</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aparelhos em Manutenção</span>
              <p className="text-3xl font-black text-slate-900">
                {equipments.filter((e) => e.status === 'maintenance').length}
              </p>
              <p className="text-xs text-red-600 font-bold">Acompanhados pela equipe técnica</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Top 5 Recursos Mais Solicitados pelos Professores</h3>
            <div className="space-y-3 pt-2">
              {topEquipments.map(([name, count], index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{name}</span>
                    <span className="font-semibold text-blue-700">{count} agendamento(s)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, (count / (totalBookings || 1)) * 100 * 2)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR NOVO BEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Novo Cadastro Patrimonial</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nome do Equipamento / Material *</label>
                <input
                  type="text"
                  placeholder="Ex: Datashow Portátil BenQ Laser"
                  value={newEquipName}
                  onChange={(e) => setNewEquipName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nº Patrimônio *</label>
                  <input
                    type="text"
                    value={newEquipPatrimony}
                    onChange={(e) => setNewEquipPatrimony(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tipo de Recurso</label>
                  <select
                    value={newEquipType}
                    onChange={(e) => setNewEquipType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="tecnologico">Equipamento Tecnológico</option>
                    <option value="pedagogico">Material Pedagógico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Localização (Almoxarifado)</label>
                  <input
                    type="text"
                    value={newEquipLocation}
                    onChange={(e) => setNewEquipLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Quantidade Total</label>
                  <input
                    type="number"
                    min={1}
                    value={newEquipTotal}
                    onChange={(e) => setNewEquipTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Especificações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes técnicos, cabos inclusos, modelo..."
                  value={newEquipSpecs}
                  onChange={(e) => setNewEquipSpecs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow cursor-pointer"
                >
                  Salvar no Patrimônio
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECUSAR RESERVA */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Justificativa de Recusa</h3>
            <p className="text-xs text-slate-500">
              Informe ao solicitante o motivo pelo qual a reserva não pôde ser atendida:
            </p>

            <textarea
              rows={3}
              placeholder="Ex: Sala não possui ponto de rede adequado; equipamento agendado para manutenção técnica."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl"
            />

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onRejectReservation(rejectingId, rejectionReason);
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow"
              >
                Confirmar Recusa
              </button>
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHECK-IN DE DEVOLUÇÃO */}
      {checkingInId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Conferência de Devolução (Check-In)</h3>
            <p className="text-xs text-slate-500">
              Verifique cabos, travas, controle remoto e estado de conservação do equipamento.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações de Devolução / Avarias (Opcional):
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Devolvido em perfeito estado com todos os cabos conferidos."
                value={returnObservation}
                onChange={(e) => setReturnObservation(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onCheckInReservation(checkingInId, returnObservation);
                  setCheckingInId(null);
                  setReturnObservation('');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow"
              >
                Concluir Devolução
              </button>
              <button
                onClick={() => setCheckingInId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
