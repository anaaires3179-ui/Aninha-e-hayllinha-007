import React, { useState, useEffect, useRef } from 'react';
import { Equipment, Reservation, BotMessage, Shift } from '../types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Wrench
} from './Icons';
import { 
  checkReservationConflict, 
  findAlternativeEquipment, 
  getDefaultShiftTimes,
  formatDateBr
} from '../utils/conflictEngine';

interface TechBotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  reservations: Reservation[];
  todayDate: string;
  onAddReservation: (newReservation: Reservation) => void;
}

interface PendingBotState {
  equipId?: string;
  equipName?: string;
  equipCategory?: string;
  chromebookType?: 'carrinho' | 'individual';
  chromebookQty?: number;
  room?: string;
  date?: string;
  shift?: Shift;
  startTime?: string;
  endTime?: string;
  readyToBook?: boolean;
  step?: string | null;
}

export const TechBotDrawer: React.FC<TechBotDrawerProps> = ({
  isOpen,
  onClose,
  equipments,
  reservations,
  todayDate,
  onAddReservation
}) => {
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      text: 'Olá, Professor(a)! Sou o TechBot, assistente inteligente de multimídias da escola. Posso verificar disponibilidade em tempo real e agendar equipamentos e materiais pedagógicos para suas aulas em poucos segundos.\n\nComo posso ajudar hoje?',
      timestamp: 'Agora'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [pendingData, setPendingData] = useState<PendingBotState>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: BotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: 'Agora'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      processBotLogic(text.toLowerCase());
      setIsTyping(false);
    }, 550);
  };

  const processBotLogic = (userText: string) => {
    let reply = '';
    let toolCall: BotMessage['toolCall'] | undefined;
    let data: PendingBotState = { ...pendingData };

    // 1. CONFIRMATION TO BOOK
    const isAffirmative =
      userText.includes('sim') ||
      userText.includes('pode') ||
      userText.includes('confirma') ||
      userText.includes('positivo') ||
      userText.includes('fechado') ||
      userText.includes('ok') ||
      userText.includes('gravar');

    if (isAffirmative && data.readyToBook && data.equipId && data.room) {
      const equip = equipments.find((i) => i.id === data.equipId) || equipments[0];
      const newId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking: Reservation = {
        id: newId,
        equipmentId: equip.id,
        equipmentName: equip.name,
        resourceType: equip.resourceType,
        category: equip.category,
        patrimonyNumber: equip.patrimonyNumber,
        quantity: 1,
        date: data.date || todayDate,
        shift: data.shift || 'Manhã',
        startTime: data.startTime || '07:30',
        endTime: data.endTime || '11:45',
        room: data.room,
        professor: 'Você (Via TechBot)',
        functionalId: 'FUNC-BOT',
        subject: 'Multimídia Geral',
        turma: '9º Ano A',
        pedagogicalPurpose: 'Agendamento interativo assistido via TechBot',
        status: 'approved',
        createdAt: 'Agora',
        notes: 'Agendamento automatizado via TechBot'
      };

      onAddReservation(newBooking);

      toolCall = {
        name: 'criar_agendamento',
        params: {
          id: newId,
          recurso: equip.name,
          patrimonio: equip.patrimonyNumber,
          sala: data.room,
          data: data.date,
          turno: data.shift
        },
        status: 'success'
      };

      reply = `✅ [Ferramenta criar_agendamento executada com sucesso!]\n\nSeu agendamento foi registrado e aprovado no sistema!\n• Código: ${newId}\n• Equipamento: ${equip.name} (${equip.patrimonyNumber})\n• Local: ${data.room}\n• Data/Turno: ${formatDateBr(data.date || todayDate)} (${data.shift} - ${data.startTime} às ${data.endTime})\n\nO recurso estará conferido e pronto para uso. Deseja realizar mais alguma solicitação?`;

      setPendingData({});
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: 'Agora',
          toolCall
        }
      ]);
      return;
    }

    // 2. CHECK GENERAL STATUS QUERY
    if (userText.includes('quais equipamentos') || userText.includes('livres agora') || userText.includes('disponíveis')) {
      const availableEquips = equipments.filter((e) => e.status === 'available');
      reply = `Atualmente temos ${availableEquips.length} equipamentos livres para reserva imediata:\n\n• Carrinhos de Chromebooks (01 e 02)\n• Smart TVs móveis 4K (55" e 65")\n• Projetor Laser Epson 4500L\n• Caixa de Som Portátil JBL EON\n• Microscópios e Materiais de Ciências\n• Kits de Robótica e Matemática\n\nQual deles você gostaria de utilizar e em qual sala?`;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: 'Agora'
        }
      ]);
      return;
    }

    // 3. EQUIPMENT DETECTION
    if (userText.includes('chromebook') || userText.includes('chrome') || userText.includes('computador')) {
      data.equipCategory = 'chromebooks';
      if (!data.chromebookType) {
        if (userText.includes('carrinho')) {
          data.equipId = 'cb-cart-01';
          data.equipName = 'Carrinho Móvel 36 Chromebooks Lenovo';
          data.chromebookType = 'carrinho';
        } else if (userText.includes('avulso') || userText.includes('individual')) {
          data.equipId = 'cb-ind-01';
          data.equipName = 'Chromebooks Individuais Avulsos';
          data.chromebookType = 'individual';
        } else {
          reply = "Para os Chromebooks, você precisa do 'carrinho completo' (36 unidades integradas) ou de 'unidades avulsas'?";
          data.step = 'awaiting_cb_type';
          setPendingData(data);
          setMessages((prev) => [
            ...prev,
            { id: `bot-${Date.now()}`, role: 'assistant', text: reply, timestamp: 'Agora' }
          ]);
          return;
        }
      }
    } else if (userText.includes('tv') || userText.includes('televis') || userText.includes('monitor')) {
      data.equipId = 'tv-55-01';
      data.equipName = 'Smart TV 55" 4K LG em Pedestal Móvel';
    } else if (userText.includes('projetor') || userText.includes('epson') || userText.includes('datashow')) {
      data.equipId = 'proj-01';
      data.equipName = 'Projetor Datashow Epson Laser 4500 Lumens';
    } else if (userText.includes('caixa') || userText.includes('som') || userText.includes('jbl') || userText.includes('audio')) {
      data.equipId = 'audio-jbl-01';
      data.equipName = 'Caixa de Som Ativa JBL EON One Portátil';
    } else if (userText.includes('cabo') || userText.includes('adaptador') || userText.includes('passador')) {
      data.equipId = 'kit-cabos-01';
      data.equipName = 'Kit Adaptadores HDMI/VGA + Passador';
    } else if (userText.includes('microscópio') || userText.includes('microscopio') || userText.includes('lâmina')) {
      data.equipId = 'mic-bio-01';
      data.equipName = 'Microscópios Biológicos Monoculares Ópticos';
    } else if (userText.includes('microfone') || userText.includes('mic')) {
      data.equipId = 'mic-uhf-01';
      data.equipName = 'Kit Microfones sem Fio Duplo UHF Shure';
    }

    // Step awaiting chromebook type
    if (data.step === 'awaiting_cb_type') {
      if (userText.includes('carrinho') || userText.includes('todos') || userText.includes('completo')) {
        data.equipId = 'cb-cart-01';
        data.equipName = 'Carrinho Móvel 36 Chromebooks Lenovo';
        data.chromebookType = 'carrinho';
        data.step = null;
      } else {
        data.equipId = 'cb-ind-01';
        data.equipName = 'Chromebooks Individuais Avulsos';
        data.chromebookType = 'individual';
        data.step = null;
      }
    }

    // 4. ROOM / ENVIRONMENT EXTRACTION (Mandatory parameter!)
    const matchRoom = userText.match(
      /(sala\s*\d+|audit[óo]rio(\s*central|\s*master)?|laborat[óo]rio(\s*de\s*\w+|\s*\d+)?|lab\s*\d*|bloco\s*[a-z]|anfiteatro|biblioteca)/i
    );
    if (matchRoom) {
      data.room = matchRoom[0].toUpperCase();
    }

    // 5. DATE AND SHIFT EXTRACTION
    if (userText.includes('amanhã') || userText.includes('amanha')) {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      data.date = tom.toISOString().split('T')[0];
    } else if (userText.includes('hoje') || !data.date) {
      data.date = todayDate;
    }

    if (userText.includes('manhã') || userText.includes('manha')) {
      data.shift = 'Manhã';
      const def = getDefaultShiftTimes('Manhã');
      data.startTime = def.startTime;
      data.endTime = def.endTime;
    } else if (userText.includes('tarde')) {
      data.shift = 'Tarde';
      const def = getDefaultShiftTimes('Tarde');
      data.startTime = def.startTime;
      data.endTime = def.endTime;
    } else if (userText.includes('noite')) {
      data.shift = 'Noite';
      const def = getDefaultShiftTimes('Noite');
      data.startTime = def.startTime;
      data.endTime = def.endTime;
    }

    // 6. VALIDATION OR PROPOSAL
    if (!data.equipId) {
      reply =
        'Qual equipamento ou material você precisa? Temos disponíveis:\n• Carrinho de Chromebooks\n• Smart TVs móveis 4K\n• Datashow Projetor Laser Epson\n• Caixa de Som Portátil JBL\n• Microscópios e Kits de Robótica';
    } else if (!data.room) {
      reply = `Entendido! Você escolheu ${data.equipName}. Como nossos recursos são móveis, em qual sala ou espaço pedagógico você irá utilizá-lo? (Ex: Sala 202, Auditório, Lab de Informática)`;
    } else if (!data.shift) {
      reply = `Perfeito para a ${data.room}. Para qual turno você precisa? (Manhã, Tarde ou Noite)`;
    } else {
      const equipObj = equipments.find((e) => e.id === data.equipId);

      // TOOL TRIGGER: consultar_disponibilidade
      const conflictResult = equipObj
        ? checkReservationConflict(
            reservations,
            equipObj,
            1,
            data.date,
            data.shift,
            data.startTime || '07:30',
            data.endTime || '11:45'
          )
        : { hasConflict: false };

      if (conflictResult.hasConflict) {
        // Propose alternative equivalent
        const alternative = equipObj
          ? findAlternativeEquipment(
              equipments,
              reservations,
              equipObj.id,
              1,
              data.date,
              data.shift,
              data.startTime || '07:30',
              data.endTime || '11:45'
            )
          : null;

        toolCall = {
          name: 'consultar_disponibilidade',
          params: {
            recurso: data.equipName,
            data: data.date,
            turno: data.shift
          },
          status: 'warning'
        };

        if (alternative) {
          reply = `⚠️ [Tool consultar_disponibilidade]: O equipamento ${data.equipName} já está ocupado neste horário.\n\nPorém, verifiquei e o recurso equivalente "${alternative.name}" (${alternative.patrimonyNumber}) está 100% DISPONÍVEL!\n\nDeseja que eu agende ${alternative.name} para a ${data.room} no turno da ${data.shift}? (Responda "Sim" para confirmar)`;
          data.equipId = alternative.id;
          data.equipName = alternative.name;
          data.readyToBook = true;
        } else {
          reply = `⚠️ [Tool consultar_disponibilidade]: Não há unidades livres de ${data.equipName} no turno da ${data.shift} para ${formatDateBr(data.date)}. Poderia ser em outro turno (Manhã, Tarde ou Noite)?`;
          data.readyToBook = false;
        }
      } else {
        data.readyToBook = true;
        toolCall = {
          name: 'consultar_disponibilidade',
          params: {
            recurso: data.equipName,
            data: data.date,
            turno: data.shift
          },
          status: 'success'
        };

        reply = `🔍 [Tool consultar_disponibilidade]: Recurso 100% livre e disponível!\n\n📋 Resumo da Solicitação:\n• Recurso: ${data.equipName}\n• Local: ${data.room}\n• Data: ${formatDateBr(data.date)}\n• Turno: ${data.shift} (${data.startTime} às ${data.endTime})\n\nPosso confirmar e criar este agendamento agora? (Responda "Sim" para concluir)`;
      }
    }

    setPendingData(data);
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: 'Agora',
        toolCall
      }
    ]);
  };

  const quickPrompts = [
    'Preciso de uma Smart TV para a Sala 202 hoje à tarde',
    'Gostaria de agendar 30 chromebooks para o Laboratório',
    'Projetor laser para o Auditório amanhã de manhã',
    'Quais equipamentos estão livres agora?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slideLeft border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                TechBot Multimídia
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Tool-Assisted
                </span>
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Assistente Ativo com Anti-Conflito
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar TechBot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.toolCall && (
                <div className="mb-1.5 inline-flex items-center gap-1.5 bg-slate-800 text-slate-200 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-700">
                  <Wrench className="w-3 h-3 text-emerald-400" />
                  <span>fn: {msg.toolCall.name}()</span>
                  <span
                    className={`px-1 py-0.2 rounded font-bold uppercase text-[9px] ${
                      msg.toolCall.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {msg.toolCall.status}
                  </span>
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 shadow-xs whitespace-pre-line leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.role === 'user' ? 'Você' : 'TechBot'} • {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-2 bg-white rounded-xl border border-slate-200/60 w-fit">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-medium text-slate-500 ml-1">TechBot consultando disponibilidade...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-100/90 border-t border-slate-200 overflow-x-auto flex gap-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap bg-white hover:bg-slate-200 text-slate-700 text-[11px] px-3 py-1.5 rounded-lg border border-slate-300/80 transition cursor-pointer shrink-0 font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Preciso de uma TV na Sala 202 hoje..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
