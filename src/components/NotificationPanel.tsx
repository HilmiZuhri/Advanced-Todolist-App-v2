/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertCircle, Clock, CalendarCheck, CheckSquare } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onDismissOne: (id: string) => void;
  onLocateTask: (taskId: string) => void;
}

export default function NotificationPanel({
  notifications,
  isOpen,
  onClose,
  onClearAll,
  onDismissOne,
  onLocateTask,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#notifications-trigger')
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={panelRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notification-panel-overlay"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-205 dark:border-slate-800/85 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Task Reminders ({unreadCount})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    id="clear-all-btn"
                    onClick={onClearAll}
                    className="text-xs text-slate-505 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
                  >
                    Dismiss All
                  </button>
                )}
                <button
                  id="close-panel-btn"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  aria-label="Close notification panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
              {unreadCount === 0 ? (
                <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-3">
                    <CheckSquare className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    All caught up!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                    No overdue tasks or upcoming deadlines.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  let badgeBg = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40';
                  let icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;

                  if (notification.type === 'due-today') {
                    badgeBg = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40';
                    icon = <Clock className="w-5 h-5 text-amber-500 shrink-0" />;
                  } else if (notification.type === 'due-soon') {
                    badgeBg = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40';
                    icon = <CalendarCheck className="w-5 h-5 text-blue-500 shrink-0" />;
                  }

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`p-3 rounded-lg border flex gap-3 group text-left cursor-pointer transition-colors ${badgeBg}`}
                      onClick={() => {
                        onLocateTask(notification.taskId);
                        onClose();
                      }}
                    >
                      {icon}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:underline">
                          {notification.taskTitle}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        id={`dismiss-${notification.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissOne(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-slate-400 dark:text-slate-300 transition-opacity cursor-pointer"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {/* Footer */}
            {unreadCount > 0 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 text-center bg-slate-50 dark:bg-slate-950/40 rounded-b-2xl">
                <span className="text-[10px] text-slate-505 dark:text-slate-400 leading-none font-mono">
                  Click a task to highlight and find it instantly.
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
