import { useNotificationStore } from '@/store/notification-store';

export function useNotification() {
  const { notifications, addNotification, removeNotification, clearAll } = useNotificationStore();

  return {
    notifications,
    toast: {
      info: (title: string, message?: string) => addNotification({ type: 'info', title, message }),
      success: (title: string, message?: string) => addNotification({ type: 'success', title, message }),
      warning: (title: string, message?: string) => addNotification({ type: 'warning', title, message }),
      error: (title: string, message?: string) => addNotification({ type: 'error', title, message })
    },
    removeNotification,
    clearAll
  };
}
