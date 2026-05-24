export default function RoleBadge({ role }: { role: string }) {
  const color = role === 'waiter' ? 'bg-purple-500/20 text-purple-500' : 'bg-orange-500/20 text-orange-500';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{role.toUpperCase()}</span>;
}
