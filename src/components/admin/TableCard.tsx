import { useToast } from '@/context/ToastContext';
import { Table } from '@/types/table';
import { tableService } from '@/services/tableService';
import { Copy, Download, ToggleLeft, ToggleRight, Trash2, User as UserIcon } from 'lucide-react';
import { getBaseUrl } from '@/lib/getBaseUrl';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Session } from '@/types/session';
import { SessionDisplay } from '../SessionTimer';
import { getStaff } from '@/services/userService';
import { User } from '@/types/user';

interface TableCardProps {
  table: Table;
  restaurantId: string;
}

export function TableCard({ table, restaurantId }: TableCardProps) {
  const { showToast } = useToast();
  const baseUrl = getBaseUrl();
  const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}${table.qrUrl}`)}`;
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [waiters, setWaiters] = useState<User[]>([]);

  useEffect(() => {
    if (!restaurantId || !table.id) return
      
    const q = query(
        collection(db, `restaurants/${restaurantId}/sessions`),
        where('tableId', '==', table.id),
        where('isActive', '==', true)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const session = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Session
            setActiveSession(session)
        } else {
            setActiveSession(null)
        }
    })
    
    getStaff(restaurantId).then(staff => setWaiters(staff.filter(u => u.role === 'waiter')));
    
    return () => unsubscribe()
  }, [restaurantId, table.id])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${baseUrl}${table.qrUrl}`);
    showToast('Link copied to clipboard');
  };

  const downloadQr = async () => {
    const response = await fetch(qrCodeApi);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${table.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAssignWaiter = async (waiterId: string) => {
    await tableService.assignWaiterToTable(restaurantId, table.id, waiterId === 'none' ? null : waiterId);
    showToast('Waiter assigned successfully');
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-800">{table.name}</h3>
        <button
          onClick={() => tableService.setTableActiveStatus(restaurantId, table.id, !table.active)}
          className="text-slate-500 hover:text-blue-600"
        >
          {table.active ? <ToggleRight className="text-blue-500" /> : <ToggleLeft />}
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center mb-4">
        <img src={qrCodeApi} alt={`QR for ${table.name}`} className="w-40 h-40 mb-4 rounded-lg" />
        <div className="flex gap-2">
            <button onClick={copyToClipboard} className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 rounded-lg"><Copy size={18} /></button>
            <button onClick={downloadQr} className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 rounded-lg"><Download size={18} /></button>
            <button onClick={() => tableService.deleteTable(restaurantId, table.id)} className="p-2 text-slate-500 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={18} /></button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">Assign Waiter</label>
        <select 
            value={table.assignedWaiterId || 'none'}
            onChange={e => handleAssignWaiter(e.target.value)}
            className="w-full border border-slate-200 p-2 rounded-lg text-sm"
        >
            <option value="none">Unassigned</option>
            {waiters.map(waiter => (
                <option key={waiter.id} value={waiter.id}>{waiter.name}</option>
            ))}
        </select>
      </div>

      <div className="text-sm text-slate-500 mt-4 text-center">
        {activeSession ? (
            <SessionDisplay session={activeSession} />
        ) : (
            <span className={`font-semibold ${table.active ? 'text-green-500' : 'text-slate-400'}`}>{table.active ? 'Active' : 'Inactive'}</span>
        )}
      </div>
    </div>
  );
}
