import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Flame,
  Sparkles,
  Trophy,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { NotificationItem } from '../../types/index.ts';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600" />
            Academic &amp; Study Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time alerts regarding daily tasks, note requirements, streaks and score updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-fit border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            filter === 'unread'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold">No notifications to show</p>
            <p className="mt-1">You are all caught up with your study tasks!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifs.map((item) => (
              <div
                key={item.id}
                className={`py-4 px-2 flex items-start justify-between gap-4 transition-colors rounded-2xl ${
                  !item.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl mt-0.5 shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.type === 'streak_alert' ? (
                      <Flame className="w-5 h-5 text-amber-500" />
                    ) : item.type === 'score_boost' ? (
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    ) : item.type === 'challenge_update' ? (
                      <Trophy className="w-5 h-5 text-purple-600" />
                    ) : item.type === 'task_pending' ? (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
