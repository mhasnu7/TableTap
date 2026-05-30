import React from 'react';
import { Session } from '@/types/session';

interface SessionInfoProps {
  session: Session;
}

export const SessionDisplay: React.FC<SessionInfoProps> = ({ session }) => {
  const startTime = new Date(session.startTime).getTime();
  const now = new Date().getTime();
  const diffInMinutes = Math.floor((now - startTime) / 60000);
  
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  const durationText = diffInMinutes < 0 ? "Just Started" : `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  
  const totalItems = session.orders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col">
            <span className="text-gray-500 font-medium text-xs">Session Duration</span>
            <span className="font-bold text-gray-900">{durationText}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-gray-500 font-medium text-xs">Running Total</span>
            <span className="font-bold text-gray-900">₹{session.total.toFixed(2)}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-gray-500 font-medium text-xs">Items Ordered</span>
            <span className="font-bold text-gray-900">{totalItems}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-gray-500 font-medium text-xs">Payment Mode</span>
            <span className="font-bold text-gray-900">{session.paymentMode}</span>
        </div>
    </div>
  );
};
