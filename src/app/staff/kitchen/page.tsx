import ProtectedStaffRoute from '@/components/auth/ProtectedStaffRoute';
import { STAFF_ROLES } from '@/lib/staffConfig';
import KitchenDashboard from '@/app/kitchen/page';

export default function KitchenPage() {
  return (
    <ProtectedStaffRoute role={STAFF_ROLES.KITCHEN}>
      <KitchenDashboard />
    </ProtectedStaffRoute>
  );
}
