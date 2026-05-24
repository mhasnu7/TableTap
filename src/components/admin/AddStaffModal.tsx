import { useState } from 'react';
import { addStaff } from '../../services/staffService';
import { checkPhoneExists } from '../../services/userService';
import { UserRole } from '../../types/user';
import { useToast } from '../../context/ToastContext';

export default function AddStaffModal({ isOpen, onClose, restaurantId }: { isOpen: boolean; onClose: () => void; restaurantId: string }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', pin: '', role: 'waiter' as UserRole, active: true });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const phoneExists = await checkPhoneExists(formData.phone, restaurantId);
    if (phoneExists) {
      showToast('Phone number already exists for another staff member in this restaurant.');
      setLoading(false);
      return;
    }

    try {
      await addStaff(restaurantId, { 
        name: formData.name, 
        phone: formData.phone,
        email: formData.email,
        pin: formData.pin, 
        role: formData.role, 
        active: formData.active 
      });
      showToast('Staff member added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding staff:', error);
      showToast('Failed to add staff member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Staff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" className="w-full p-2 rounded bg-background border border-border" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input type="tel" placeholder="Phone Number" className="w-full p-2 rounded bg-background border border-border" onChange={e => setFormData({...formData, phone: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full p-2 rounded bg-background border border-border" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="PIN" className="w-full p-2 rounded bg-background border border-border" onChange={e => setFormData({...formData, pin: e.target.value})} required />
          <select className="w-full p-2 rounded bg-background border border-border" onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
          </select>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={e => setFormData({...formData, active: e.target.checked})}
              className="h-4 w-4 text-primary rounded"
            />
            <label htmlFor="active" className="text-sm font-medium">Active</label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-muted">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
