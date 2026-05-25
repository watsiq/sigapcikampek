/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationBellProps {
  currentUser: UserProfile;
}

export function NotificationBell({ currentUser }: NotificationBellProps) {
  const { notifications, setNotifications } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className={`p-2 rounded-xl border transition-all ${isNotificationsOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-tada' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-slate-100 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                <button 
                  onClick={() => {
                    setNotifications(notifications.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n));
                  }}
                  className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                >
                  Tandai Semua Dibaca
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
                  <div className="py-12 px-6 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm text-slate-400 italic">Belum ada notifikasi baru</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.filter(n => n.userId === currentUser.id).map((notif) => (
                      <div key={notif.id} className={`p-5 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-xl mt-0.5 ${
                            notif.type === 'APPROVAL' ? 'bg-emerald-100 text-emerald-600' :
                            notif.type === 'REVISION' ? 'bg-rose-100 text-rose-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {notif.type === 'APPROVAL' ? <CheckCircle size={16} /> : 
                             notif.type === 'REVISION' ? <AlertCircle size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{notif.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{new Date(notif.timestamp).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
