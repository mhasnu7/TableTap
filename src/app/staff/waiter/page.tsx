import ProtectedStaffRoute from '@/components/auth/ProtectedStaffRoute';
import { STAFF_ROLES } from '@/lib/staffConfig';
import StaffDashboard from '@/app/staff/dashboard/page';

export default function WaiterPage() {
  return (
    <ProtectedStaffRoute role={STAFF_ROLES.WAITER}>
      <StaffDashboard />
    </ProtectedStaffRoute>
  );
}
