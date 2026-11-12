import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle2 } from './Icons';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Central de Notificações</h3>
              <p className="text-[11px] text-slate-400">Avisos de reservas, devoluções e manutenções</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-2xl text-xs space-y-1 transition ${
                n.read ? 'bg-slate-50 text-slate-600' : 'bg-blue-50/70 border border-blue-200 text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {n.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : n.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-400">{n.createdAt}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Marcar todas como lidas
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
