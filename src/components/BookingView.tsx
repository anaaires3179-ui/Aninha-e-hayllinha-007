import React, { useState, useEffect } from 'react';
import { 
  Equipment, 
  Reservation, 
  Shift, 
  UserProfile, 
  BookingModalType, 
  KitPreset 
} from '../types';
import { 
  SCHOOL_ROOMS, 
  SCHOOL_TURMAS, 
  SCHOOL_SUBJECTS, 
  INITIAL_KITS 
} from '../data/mockData';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  User, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Box,
  Layers,
  Users,
  Repeat,
  Check,
  PackageCheck
} from './Icons';
import { 
  checkReservationConflict, 
  findAlternativeEquipment, 
  getDefaultShiftTimes,
  formatDateBr
} from '../utils/conflictEngine';

interface BookingViewProps {
  equipments: Equipment[];
  reservations: Reservation[];
  currentUser: UserProfile;
  todayDate: string;
  initialEquipmentId?: string;
  initialMode?: BookingModalType;
  onBookingConfirmed: (newBooking: Reservation) => void;
  onCancel: () => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  equipments,
  reservations,
  currentUser,
  todayDate,
  initialEquipmentId,
  initialMode = 'individual',
  onBookingConfirmed,
  onCancel
}) => {
  // Modalidade de fluxo ativa
  const [bookingMode, setBookingMode] = useState<BookingModalType>(initialMode);

  // Form states
  const [equipmentId, setEquipmentId] = useState<string>(initialEquipmentId || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState<string>(todayDate);
  const [shift, setShift] = useState<Shift>('Manhã');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('11:45');
  const [room, setRoom] = useState<string>('Sala 101 - Bloco A');
  const [turma, setTurma] = useState<string>(SCHOOL_TURMAS[0]);
  const [subject, setSubject] = useState<string>(SCHOOL_SUBJECTS[0]);
  const [pedagogicalPurpose, setPedagogicalPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Solicitante data
  const [professorName, setProfessorName] = useState<string>(currentUser.name);
  const [functionalId, setFunctionalId] = useState<string>(currentUser.functionalId);

  // Recurrent booking options
  const [isRecurrent, setIsRecurrent] = useState<boolean>(initialMode === 'recurrent');
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21); // 3 semanas depois
    return d.toISOString().split('T')[0];
  });
  const [recurrentDays, setRecurrentDays] = useState<string[]>(['Terça', 'Quinta']);

  // Accessories checkboxes
  const [neededAccessories, setNeededAccessories] = useState<string[]>([]);

  // Category filter state for Opção 2
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selected Kit Preset for Opção 7
  const [selectedKit, setSelectedKit] = useState<KitPreset | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEquipmentId) {
      setEquipmentId(initialEquipmentId);
      const eq = equipments.find((e) => e.id === initialEquipmentId);
      if (eq) {
        setQuantity(1);
      }
    }
  }, [initialEquipmentId, equipments]);

  useEffect(() => {
    if (initialMode) {
      setBookingMode(initialMode);
      if (initialMode === 'recurrent') setIsRecurrent(true);
    }
  }, [initialMode]);

  const handleShiftChange = (newShift: Shift) => {
    setShift(newShift);
    const defaults = getDefaultShiftTimes(newShift);
    setStartTime(defaults.startTime);
    setEndTime(defaults.endTime);
  };

  const selectedEquipment = equipments.find((e) => e.id === equipmentId);

  // Real-time conflict validation
  const conflictResult = selectedEquipment
    ? checkReservationConflict(
        reservations,
        selectedEquipment,
        quantity,
        date,
        shift,
        startTime,
        endTime
      )
    : { hasConflict: false, remainingAvailable: 1 };

  // Alternative equipment suggestion
  const suggestedAlternative = (conflictResult.hasConflict && selectedEquipment)
    ? findAlternativeEquipment(
        equipments,
        reservations,
        selectedEquipment.id,
        quantity,
        date,
        shift,
        startTime,
        endTime
      )
    : null;

  const toggleAccessory = (acc: string) => {
    setNeededAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const toggleRecurrentDay = (day: string) => {
    setRecurrentDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedEquipment) {
      setValidationError('Por favor, selecione o equipamento ou material desejado.');
      return;
    }

    if (quantity < 1 || (selectedEquipment && quantity > selectedEquipment.totalQuantity)) {
      setValidationError(
        `A quantidade informada (${quantity}) excede o total cadastrado no patrimônio da instituição (${selectedEquipment?.totalQuantity || 1}).`
      );
      return;
    }

    if (!pedagogicalPurpose.trim()) {
      setValidationError('Por favor, informe a finalidade pedagógica da aula/atividade.');
      return;
    }

    if (!room.trim()) {
      setValidationError('Por favor, informe o local ou sala de utilização.');
      return;
    }

    if (conflictResult.hasConflict) {
      setValidationError(
        'Existe um conflito de horário ou o estoque disponível para este horário está esgotado. Escolha outro horário ou use o recurso alternativo sugerido.'
      );
      return;
    }

    const newBooking: Reservation = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      resourceType: selectedEquipment.resourceType,
      category: selectedEquipment.category,
      patrimonyNumber: selectedEquipment.patrimonyNumber,
      quantity,
      date,
      endDate: isRecurrent ? endDate : undefined,
      isRecurrent,
      recurrentDays: isRecurrent ? recurrentDays : undefined,
      shift,
      startTime,
      endTime,
      room,
      professor: professorName.trim(),
      functionalId: functionalId.trim(),
      subject,
      turma,
      pedagogicalPurpose: pedagogicalPurpose.trim(),
      neededAccessories: neededAccessories.length > 0 ? neededAccessories : undefined,
      notes: notes.trim() || undefined,
      status: 'approved', // Auto-approved in this prototype for fast, seamless UX
      createdAt: 'Agora'
    };

    onBookingConfirmed(newBooking);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. SELEÇÃO DA MODALIDADE DE AGENDAMENTO (OPÇÕES 1 A 7 DO PROMPT) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modalidade de Solicitação
          </span>
          <span className="text-xs font-semibold text-blue-600">
            {bookingMode === 'individual' && 'Opção 1 — Por Equipamento'}
            {bookingMode === 'category' && 'Opção 2 — Por Categoria'}
            {bookingMode === 'datetime' && 'Opção 3 — Por Data e Horário'}
            {bookingMode === 'turma' && 'Opção 4 — Por Turma'}
            {bookingMode === 'room' && 'Opção 5 — Por Sala / Espaço'}
            {bookingMode === 'recurrent' && 'Opção 6 — Recorrente'}
            {bookingMode === 'kit' && 'Opção 7 — Kit Multimídia'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-xs">
          {[
            { id: 'individual', label: '1. Equipamento' },
            { id: 'category', label: '2. Categoria' },
            { id: 'datetime', label: '3. Data/Hora' },
            { id: 'turma', label: '4. Turma' },
            { id: 'room', label: '5. Sala/Espaço' },
            { id: 'recurrent', label: '6. Recorrente' },
            { id: 'kit', label: '7. Kit Completo' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setBookingMode(mode.id as BookingModalType);
                if (mode.id === 'recurrent') setIsRecurrent(true);
              }}
              className={`py-2 px-2.5 rounded-xl font-bold text-center transition cursor-pointer text-[11px] ${
                bookingMode === mode.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FORMULÁRIO PRINCIPAL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Formulário Oficial de Agendamento Escolar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Preencha todos os dados com precisão para registrar a finalidade pedagógica e assegurar a liberação dos recursos.
          </p>
        </div>

        {validationError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-xs sm:text-sm animate-pulse">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">Atenção ao preenchimento</p>
              <p className="mt-0.5">{validationError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELEÇÃO POR KIT SE MODALIDADE FOR KIT */}
          {bookingMode === 'kit' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                Selecione o Kit Multimídia Pronto:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {INITIAL_KITS.map((kit) => (
                  <div
                    key={kit.id}
                    onClick={() => {
                      setSelectedKit(kit);
                      // Auto-select premier equipment of this kit
                      if (kit.id.includes('aula')) setEquipmentId('proj-01');
                      if (kit.id.includes('lab')) setEquipmentId('cb-cart-01');
                      if (kit.id.includes('ciencias')) setEquipmentId('mic-bio-01');
                      if (kit.id.includes('auditorio')) setEquipmentId('tv-65-01');
                      setNeededAccessories(['Extensão Elétrica 20m', 'Adaptador HDMI / VGA']);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedKit?.id === kit.id
                        ? 'bg-white border-blue-600 text-blue-950 font-semibold shadow-sm ring-1 ring-blue-500'
                        : 'border-blue-200/60 bg-white/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-sm text-blue-900">{kit.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{kit.description}</p>
                    <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>{kit.items.length} itens inclusos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. SELEÇÃO DO EQUIPAMENTO OU MATERIAL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Equipamento ou Material Pedagógico *
              </label>
              {selectedEquipment && (
                <span className="text-[11px] font-mono text-slate-500">
                  Patrimônio: <strong>{selectedEquipment.patrimonyNumber}</strong> • Estoque: <strong>{selectedEquipment.availableQuantity} de {selectedEquipment.totalQuantity} un</strong>
                </span>
              )}
            </div>

            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">-- Selecione o item do catálogo ({equipments.length} recursos) --</option>
              <optgroup label="--- Equipamentos Tecnológicos ---">
                {equipments
                  .filter((e) => e.resourceType === 'tecnologico')
                  .map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.categoryLabel.toUpperCase()}] {eq.name} — {eq.patrimonyNumber} (Disp: {eq.availableQuantity})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="--- Materiais Didáticos & Pedagógicos ---">
                {equipments
                  .filter((e) => e.resourceType === 'pedagogico')
                  .map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.categoryLabel.toUpperCase()}] {eq.name} — {eq.patrimonyNumber} (Disp: {eq.availableQuantity})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* QUANTIDADE SOLICITADA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Quantidade Necessária *
              </label>
              <input
                type="number"
                min={1}
                max={selectedEquipment?.totalQuantity || 50}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white font-bold"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total disponível em estoque: <strong>{selectedEquipment?.availableQuantity || 1}</strong>
              </span>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Localização & Acessórios Inclusos no Item:
              </span>
              <p className="text-xs text-slate-600">
                Almoxarifado: <strong>{selectedEquipment?.location || 'Almoxarifado Central'}</strong> ({selectedEquipment?.tag || 'Geral'})
              </p>
              {selectedEquipment?.accessoriesIncluded && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedEquipment.accessoriesIncluded.map((acc, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      ✓ {acc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. DATA, TURNO, FAIXA DE HORÁRIO E RECORRÊNCIA */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Data de Utilização *
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Turno de Aula *
                </label>
                <select
                  value={shift}
                  onChange={(e) => handleShiftChange(e.target.value as Shift)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Manhã">Manhã (07h30 - 11h45)</option>
                  <option value="Tarde">Tarde (13h15 - 17h30)</option>
                  <option value="Noite">Noite (19h00 - 22h30)</option>
                  <option value="Integral">Integral (08h00 - 16h30)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Horário Inicial e Final
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-1/2 px-2.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white"
                  />
                  <span className="text-slate-400 text-xs">até</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-1/2 px-2.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SE MODALIDADE FOR RECORRENTE (OPÇÃO 6) */}
            {(bookingMode === 'recurrent' || isRecurrent) && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-amber-700" />
                    Parâmetros do Agendamento Recorrente:
                  </span>
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurrent}
                      onChange={(e) => setIsRecurrent(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Ativar Repetição</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data Limite do Período (Até quando?):
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={date}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dias Fixos da Semana:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleRecurrentDay(d)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            recurrentDays.includes(d)
                              ? 'bg-amber-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. SALA OU ESPAÇO & TURMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                5. Sala ou Espaço de Utilização *
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {SCHOOL_ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Obrigatório para posicionamento prévio pelo almoxarifado.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                6. Turma Atendida *
              </label>
              <select
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {SCHOOL_TURMAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Registro no diário de bordo pedagógico.
              </span>
            </div>
          </div>

          {/* 4. DISCIPLINA & DADOS DO SOLICITANTE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                7. Disciplina / Área
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {SCHOOL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                8. Solicitante Responsável
              </label>
              <input
                type="text"
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                9. Matrícula Funcional
              </label>
              <input
                type="text"
                value={functionalId}
                onChange={(e) => setFunctionalId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-700 font-mono"
              />
            </div>
          </div>

          {/* 5. FINALIDADE PEDAGÓGICA (MANDATÓRIO) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              10. Finalidade Pedagógica da Utilização *
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Aula prática de redação no Google Docs com a turma do 3º ano; Exibição de documentário sobre ecologia; Montagem de circuitos com kit robótica."
              value={pedagogicalPurpose}
              onChange={(e) => setPedagogicalPurpose(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          {/* 6. ACESSÓRIOS ADICIONAIS NECESSÁRIOS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              11. Acessórios Extras Necessários (Checklist Almoxarifado)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                'Carretel de Extensão 20m',
                'Filtro de Linha Tripolar',
                'Adaptador USB-C p/ HDMI',
                'Adaptador VGA p/ HDMI',
                'Passador Laser de Slides',
                'Tripé Pedestal de Alumínio',
                'Cabo de Áudio P2/P10',
                'Pilhas Recarregáveis Extras'
              ].map((acc) => (
                <label
                  key={acc}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-[11px] ${
                    neededAccessories.includes(acc)
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={neededAccessories.includes(acc)}
                    onChange={() => toggleAccessory(acc)}
                    className="rounded text-blue-600"
                  />
                  <span>{acc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 7. OBSERVAÇÕES ADICIONAIS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              12. Observações Adicionais (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Alunos cadeirantes na turma; solicito posicionar próximo à porta de entrada."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 8. MOTOR ANTI-CONFLITO & FEEDBACK EM TEMPO REAL */}
          {selectedEquipment && (
            <div>
              {conflictResult.hasConflict ? (
                <div className="p-5 bg-red-50 border border-red-200 rounded-3xl space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-red-900 text-sm">
                        Conflito de Horário / Estoque Esgotado!
                      </strong>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        O recurso <strong>{selectedEquipment.name}</strong> ({selectedEquipment.patrimonyNumber})
                        já possui agendamentos conflitantes ou estoque restante insuficiente ({conflictResult.remainingAvailable} disponível) para este turno ({shift}: {startTime} às {endTime}).
                      </p>
                      {conflictResult.conflictReservation && (
                        <p className="text-[11px] text-red-600 mt-1">
                          Conflita com: <strong>{conflictResult.conflictReservation.professor}</strong> na {conflictResult.conflictReservation.room}.
                        </p>
                      )}
                    </div>
                  </div>

                  {suggestedAlternative && (
                    <div className="pt-3 border-t border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-800">
                        <span className="font-bold text-emerald-800">Alternativa Disponível Imediata:</span>{' '}
                        <strong>{suggestedAlternative.name}</strong> ({suggestedAlternative.patrimonyNumber})
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEquipmentId(suggestedAlternative.id);
                          setQuantity(1);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer self-start sm:self-auto"
                      >
                        Substituir por {suggestedAlternative.name} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Horário 100% Liberado & Validado!</span>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Estoque suficiente de {selectedEquipment.name} ({conflictResult.remainingAvailable} un disponíveis). Nenhuma sobreposição com outros docentes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTÕES DE ENVIO */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={conflictResult.hasConflict}
              className={`flex-1 font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                conflictResult.hasConflict
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-98'
              }`}
            >
              Confirmar Solicitação de Agendamento
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
