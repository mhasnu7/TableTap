import { useSetup } from '@/context/SetupContext';

export default function RestaurantInfo() {
  const { data, updateData } = useSetup();

  return (
    <div className="space-y-4">
      <input type="text" placeholder="Restaurant Name" value={data.name} onChange={(e) => updateData({ name: e.target.value })} className="w-full p-2 border rounded" />
      <textarea placeholder="Description" value={data.description} onChange={(e) => updateData({ description: e.target.value })} className="w-full p-2 border rounded" />
      <input type="text" placeholder="Cuisine Type" value={data.cuisine} onChange={(e) => updateData({ cuisine: e.target.value })} className="w-full p-2 border rounded" />
    </div>
  );
}
