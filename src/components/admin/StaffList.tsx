import { User } from '../../types/user';
import { updateStaffStatus } from '../../services/staffService';
// deleteStaff is still in userService.ts, that's okay for now
import { deleteStaff } from '../../services/userService';
import RoleBadge from './RoleBadge';
import { useToast } from '../../context/ToastContext';

export default function StaffList({ staff, restaurantId }: { staff: User[]; restaurantId: string }) {
  const { showToast } = useToast();
  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      await updateStaffStatus(restaurantId, staffId, !currentStatus);
      showToast(`Staff member status updated to ${!currentStatus ? 'active' : 'inactive'}.`);
    } catch (error) {
      console.error('Error updating staff status:', error);
      showToast('Failed to update staff status.');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(staffId);
        showToast('Staff member deleted successfully!');
      } catch (error) {
        console.error('Error deleting staff:', error);
        showToast('Failed to delete staff member.');
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Check if timestamp is a Firestore Timestamp object or a Date object
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
      <h2 className="text-xl font-bold mb-4">Staff List</h2>
      <div className="space-y-4">
        {staff.map(member => (
          <div key={member.id} className="flex justify-between items-center p-4 rounded-lg bg-background border border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{member.name}</h3>
                <RoleBadge role={member.role} />
              </div>
              <p className="text-sm text-muted-foreground">{member.phone}</p>
              <p className="text-xs text-muted-foreground">
                Created: {formatDate(member.createdAt)} • 
                Last Login: {formatDateTime(member.lastLogin)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggleStatus(member.id, member.active)}
                className={`px-3 py-1 rounded text-sm ${member.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
              >
                {member.active ? 'Active' : 'Disabled'}
              </button>
              <button onClick={() => handleDeleteStaff(member.id)} className="text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
