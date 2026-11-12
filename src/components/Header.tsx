import React from 'react';
import { UserProfile, AppNotification } from '../types';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Laptop, 
  Grid3X3, 
  Plus, 
  Bell, 
  Shield, 
  Box, 
  BookOpen, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  CheckCircle2
} from './Icons';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  activeReservationsCount: number;
  pendingApprovalsCount: number;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenBot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onSwitchUser,
  allUsers,
  activeReservationsCount,
  pendingApprovalsCount,
  notifications,
  onOpenNotifications,
  onOpenBot
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const mainTabs = [
    { id: 'dashboard', label: 'Início', icon: Grid3X3 },
    { id: 'catalog', label: 'Catálogo de Recursos', icon: Laptop },
    { id: 'booking', label: 'Novo Agendamento', icon: Plus, highlight: true },
    { id: 'kits', label: 'Kits Prontos', icon: Box },
    { id: 'calendar', label: 'Calendário & Grade', icon: Calendar },
    { 
      id: 'my-reservations', 
      label: `Minhas Reservas`, 
      badge: activeReservationsCount > 0 ? activeReservationsCount : undefined,
      icon: Clock 
    },
    { 
      id: 'admin', 
      label: 'Painel Gestor', 
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pendentes` : undefined,
      badgeColor: 'bg-amber-500 text-white',
      icon: Shield 
    }
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-xl">
      {/* Top utility sub-header with institution and role switcher */}
      <div className="bg-slate-950/80 px-4 sm:px-8 py-1.5 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-blue-400">Escola Estadual EduTech</span>
          <span className="text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">SEDUC - Secretaria de Educação e Tecnologia</span>
          <span className="hidden md:inline bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
            Sistema Oficial de Multimídias & Patrimônio
          </span>
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition cursor-pointer text-[11px]"
            title="Alternar Perfil de Teste"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold">{currentUser.name}</span>
            <span className="text-slate-400 font-normal">({currentUser.roleTitle.split('•')[0].trim()})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Alternar Perfil de Usuário
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Teste o sistema como Professor, Coordenador ou Administrador de TI:
                </p>
              </div>

              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSwitchUser(user);
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between text-xs ${
                    currentUser.id === user.id ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.roleTitle}</p>
                  </div>
                  {currentUser.id === user.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => setCurrentTab('dashboard')}
          aria-label="EduTech Reserva - Página Inicial"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            ET
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              EduTech <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">Gestão & Reserva</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Recursos Multimídia & Materiais Pedagógicos</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1" aria-label="Navegação Principal">
          {mainTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : tab.highlight
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      tab.badgeColor || (isActive ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-200')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Notifications, TechBot & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
            title="Avisos e Notificações"
            aria-label="Abrir notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* TechBot Assistant */}
          <button
            onClick={onOpenBot}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            aria-label="Abrir assistente TechBot"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">TechBot</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
            </span>
          </button>

          {/* User Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-700/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {currentUser.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400">{currentUser.functionalId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Submenu Bar for tablet/mobile */}
      <div className="xl:hidden flex border-t border-slate-800 bg-slate-950/90 text-xs overflow-x-auto px-3 py-1.5 scrollbar-none gap-1">
        {mainTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 whitespace-nowrap rounded-lg font-medium transition cursor-pointer ${
                isActive
                  ? 'text-white bg-blue-600 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-700 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
