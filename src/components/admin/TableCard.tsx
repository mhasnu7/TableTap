import { useToast } from '@/context/ToastContext';
import { Table } from '@/types/table';
import { tableService } from '@/services/tableService';
import { Copy, Download, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { getBaseUrl } from '@/lib/getBaseUrl';

interface TableCardProps {
  table: Table;
  restaurantId: string;
}

export function TableCard({ table, restaurantId }: TableCardProps) {
  const { showToast } = useToast();
  const baseUrl = getBaseUrl();
  const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}${table.qrUrl}`)}`;

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
      
      <div className="text-sm text-slate-500 mt-4 text-center">
        Status: <span className={`font-semibold ${table.active ? 'text-green-500' : 'text-slate-400'}`}>{table.active ? 'Active' : 'Inactive'}</span>
      </div>
    </div>
  );
}
