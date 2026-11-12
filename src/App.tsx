import React, { useState, useEffect } from 'react';
import { 
  Equipment, 
  Reservation, 
  Shift, 
  UserProfile, 
  AppNotification, 
  BookingModalType, 
  KitPreset 
} from './types';
import { 
  INITIAL_EQUIPMENTS, 
  INITIAL_RESERVATIONS, 
  INITIAL_NOTIFICATIONS, 
  MOCK_USERS, 
  TODAY_ISO 
} from './data/mockData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { BookingView } from './components/BookingView';
import { CalendarView } from './components/CalendarView';
import { MyReservationsView } from './components/MyReservationsView';
import { AdminPanelView } from './components/AdminPanelView';
import { KitsView } from './components/KitsView';
import { TechBotDrawer } from './components/TechBotDrawer';
import { ReceiptModal } from './components/ReceiptModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { CheckCircle2, RotateCcw } from './components/Icons';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Current active user profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('edutech_user');
      return saved ? JSON.parse(saved) : MOCK_USERS[0];
    } catch {
      return MOCK_USERS[0];
    }
  });

  // Equipments inventory state
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    try {
      const saved = localStorage.getItem('edutech_equipments_v2');
      return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS;
    } catch {
      return INITIAL_EQUIPMENTS;
    }
  });

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('edutech_reservations_v2');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('edutech_notifications_v2');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // UI Drawer / Modal states
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [selectedEquipId, setSelectedEquipId] = useState<string>('');
  const [selectedBookingMode, setSelectedBookingMode] = useState<BookingModalType>('individual');
  const [activeReceipt, setActiveReceipt] = useState<Reservation | null>(null);
  const [reportingReservation, setReportingReservation] = useState<Reservation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edutech_equipments_v2', JSON.stringify(equipments));
      localStorage.setItem('edutech_reservations_v2', JSON.stringify(reservations));
      localStorage.setItem('edutech_notifications_v2', JSON.stringify(notifications));
      localStorage.setItem('edutech_user', JSON.stringify(currentUser));
    } catch (err) {
      console.warn('Storage save error', err);
    }
  }, [equipments, reservations, notifications, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Actions
  const handleBookingConfirmed = (newBooking: Reservation) => {
    setReservations((prev) => [newBooking, ...prev]);

    // Add notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Agendamento Registrado',
      message: `Sua solicitação de ${newBooking.equipmentName} (${newBooking.id}) foi registrada com sucesso!`,
      type: 'success',
      createdAt: 'Agora',
      read: false,
      actionReservationId: newBooking.id
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Solicitação ${newBooking.id} registrada com sucesso para ${newBooking.equipmentName}!`);
    setCurrentTab('my-reservations');
  };

  const handleCancelReservation = (resId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'cancelled' as const } : r))
    );
    showToast(`Reserva ${resId} foi cancelada e o recurso foi liberado.`);
  };

  const handleStartBookingMode = (mode: BookingModalType, targetId?: string) => {
    setSelectedBookingMode(mode);
    if (targetId) setSelectedEquipId(targetId);
    setCurrentTab('booking');
  };

  const handleBookFromSchedule = (equipId: string, date: string, shift: Shift) => {
    setSelectedEquipId(equipId);
    setSelectedBookingMode('datetime');
    setCurrentTab('booking');
  };

  const handleBookKit = (kit: KitPreset) => {
    setSelectedBookingMode('kit');
    setCurrentTab('booking');
    showToast(`Kit "${kit.title}" selecionado para agendamento!`);
  };

  // Admin Actions
  const handleApproveReservation = (resId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'approved' as const } : r))
    );
    showToast(`Solicitação ${resId} aprovada com sucesso pela Coordenação!`);
  };

  const handleRejectReservation = (resId: string, reason: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r
      )
    );
    showToast(`Solicitação ${resId} recusada.`);
  };

  const handleCheckOut = (resId: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId ? { ...r, status: 'picked_up' as const, pickedUpAt: 'Hoje' } : r
      )
    );
    showToast(`Retirada física registrada para a reserva ${resId}.`);
  };

  const handleCheckIn = (resId: string, returnNotes?: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId
          ? { ...r, status: 'returned' as const, returnedAt: 'Hoje', damagedReported: returnNotes }
          : r
      )
    );
    showToast(`Devolução confirmada e recurso reintegrado ao almoxarifado.`);
  };

  const handleAddEquipment = (newEquip: Equipment) => {
    setEquipments((prev) => [newEquip, ...prev]);
    showToast(`Novo bem "${newEquip.name}" (${newEquip.patrimonyNumber}) cadastrado com sucesso!`);
  };

  const handleUpdateEquipment = (equip: Equipment) => {
    setEquipments((prev) => prev.map((e) => (e.id === equip.id ? equip : e)));
    showToast(`Patrimônio ${equip.patrimonyNumber} atualizado.`);
  };

  const handleDeleteEquipment = (equipId: string) => {
    if (confirm('Deseja realmente remover este equipamento do patrimônio escolar?')) {
      setEquipments((prev) => prev.filter((e) => e.id !== equipId));
      showToast('Equipamento removido do inventário.');
    }
  };

  const handleSubmitIssue = (resId: string, issueText: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, damagedReported: issueText } : r))
    );
    // Add admin alert notification
    const issueNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Aviso de Manutenção / Defeito',
      message: `Problema reportado no agendamento ${resId}: "${issueText}"`,
      type: 'warning',
      createdAt: 'Agora',
      read: false
    };
    setNotifications((prev) => [issueNotif, ...prev]);
    showToast('Aviso de defeito registrado e encaminhado ao setor técnico.');
  };

  const handleResetDemoData = () => {
    if (confirm('Deseja restaurar todos os recursos, agendamentos e dados padrão?')) {
      setEquipments(INITIAL_EQUIPMENTS);
      setReservations(INITIAL_RESERVATIONS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrentUser(MOCK_USERS[0]);
      localStorage.clear();
      showToast('Dados restaurados para o padrão institucional.');
    }
  };

  const activeMyReservationsCount = reservations.filter(
    (r) =>
      (r.status === 'approved' || r.status === 'in_use' || r.status === 'picked_up') &&
      (r.functionalId === currentUser.functionalId ||
        r.professor.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || 'ana'))
  ).length;

  const pendingApprovalsCount = reservations.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        allUsers={MOCK_USERS}
        activeReservationsCount={activeMyReservationsCount}
        pendingApprovalsCount={pendingApprovalsCount}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenBot={() => setIsBotOpen(true)}
      />

      {/* 2. Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 3. Main Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            equipments={equipments}
            reservations={reservations}
            currentUser={currentUser}
            todayDate={TODAY_ISO}
            notifications={notifications}
            onNavigate={setCurrentTab}
            onStartBookingMode={handleStartBookingMode}
            onOpenBot={() => setIsBotOpen(true)}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogView
            equipments={equipments}
            onSelectEquipmentForBooking={(id) => handleStartBookingMode('individual', id)}
          />
        )}

        {currentTab === 'booking' && (
          <BookingView
            equipments={equipments}
            reservations={reservations}
            currentUser={currentUser}
            todayDate={TODAY_ISO}
            initialEquipmentId={selectedEquipId}
            initialMode={selectedBookingMode}
            onBookingConfirmed={handleBookingConfirmed}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'kits' && (
          <KitsView onBookKit={handleBookKit} />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            equipments={equipments}
            reservations={reservations}
            todayDate={TODAY_ISO}
            onBookSlot={handleBookFromSchedule}
          />
        )}

        {currentTab === 'my-reservations' && (
          <MyReservationsView
            reservations={reservations}
            currentUser={currentUser}
            todayDate={TODAY_ISO}
            onCancelReservation={handleCancelReservation}
            onNavigateToBooking={() => {
              setSelectedEquipId('');
              setSelectedBookingMode('individual');
              setCurrentTab('booking');
            }}
            onViewReceipt={setActiveReceipt}
            onReportIssue={setReportingReservation}
            onRequestDateChange={(res) => {
              setSelectedEquipId(res.equipmentId);
              setSelectedBookingMode('datetime');
              setCurrentTab('booking');
            }}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanelView
            equipments={equipments}
            reservations={reservations}
            todayDate={TODAY_ISO}
            onApproveReservation={handleApproveReservation}
            onRejectReservation={handleRejectReservation}
            onCheckOutReservation={handleCheckOut}
            onCheckInReservation={handleCheckIn}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        )}
      </main>

      {/* 4. TechBot Interactive Assistant Drawer */}
      <TechBotDrawer
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        equipments={equipments}
        reservations={reservations}
        todayDate={TODAY_ISO}
        onAddReservation={handleBookingConfirmed}
      />

      {/* 5. Printable Receipt Modal */}
      <ReceiptModal
        reservation={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* 6. Notifications Feed Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          showToast('Todas as notificações foram marcadas como lidas.');
        }}
      />

      {/* 7. Report Issue Modal */}
      <ReportIssueModal
        reservation={reportingReservation}
        onClose={() => setReportingReservation(null)}
        onSubmitIssue={handleSubmitIssue}
      />

      {/* 8. Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-6 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-slate-800">
              EduTech Gestão & Reserva Escolar • SEDUC - Tocantins
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sistema Unificado de Agendamento de Equipamentos Multimídia e Materiais Pedagógicos
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer transition font-medium"
              title="Restaurar dados padrão de demonstração"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Demonstração</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Versão 3.0 • Produção</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
