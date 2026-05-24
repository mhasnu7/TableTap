import { Notification } from '../types/notification';

export default function NotificationBanner({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 p-4 z-50">
      {notifications.map(n => (
        <div key={n.id} className="bg-blue-600 text-white p-3 rounded-lg shadow-lg mb-2">
          {n.message}
        </div>
      ))}
    </div>
  );
}
