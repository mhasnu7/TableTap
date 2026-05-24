import { useSetup } from '@/context/SetupContext';

const StepWrapper = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{description}</p>
        {children}
    </div>
);

export function Step1() {
  const { data, updateData } = useSetup();
  return (
    <StepWrapper title="Restaurant Information" description="Configure your restaurant identity and cuisine details.">
      <input type="text" placeholder="Restaurant Name" value={data.name} onChange={(e) => updateData({ name: e.target.value })} className="w-full p-3 border rounded-lg" />
      <textarea placeholder="Description" value={data.description} onChange={(e) => updateData({ description: e.target.value })} className="w-full p-3 border rounded-lg" />
      <input type="text" placeholder="Cuisine Type" value={data.cuisine} onChange={(e) => updateData({ cuisine: e.target.value })} className="w-full p-3 border rounded-lg" />
    </StepWrapper>
  );
}

export function Step2() {
  const { updateData } = useSetup();
  return (
    <StepWrapper title="Branding & Theme" description="Customize how customers see your restaurant.">
      <label className="block text-sm font-medium">Logo</label>
      <input type="file" onChange={(e) => updateData({ logo: e.target.files?.[0] || null })} className="w-full p-2 border rounded" />
      <label className="block text-sm font-medium">Banner</label>
      <input type="file" onChange={(e) => updateData({ banner: e.target.files?.[0] || null })} className="w-full p-2 border rounded" />
      <label className="block text-sm font-medium">Theme Color</label>
      <input type="color" onChange={(e) => updateData({ themeColor: e.target.value })} className="w-full h-10 p-1 border rounded" />
    </StepWrapper>
  );
}

export function Step3() {
  const { data, updateData } = useSetup();
  return (
    <StepWrapper title="Payment Configuration" description="Choose how customers can pay for orders.">
      <div className="space-y-2">
        {['prepaid', 'postpaid', 'both'].map(mode => (
          <label key={mode} className={`block p-4 border rounded-lg cursor-pointer ${data.paymentMode === mode ? 'border-blue-600 bg-blue-50' : ''}`}>
            <input type="radio" name="payment" value={mode} checked={data.paymentMode === mode} onChange={() => updateData({ paymentMode: mode as any })} className="mr-2" />
            <span className="font-medium capitalize">{mode}</span>
            <p className="text-sm text-gray-500">{mode === 'prepaid' ? 'Customers pay immediately.' : mode === 'postpaid' ? 'Customers pay after meal.' : 'Both options available.'}</p>
          </label>
        ))}
      </div>
    </StepWrapper>
  );
}

export function Step4() {
  const { data, updateData } = useSetup();
  return (
    <StepWrapper title="Table Management" description="Create dining tables and QR ordering stations.">
      <input type="number" min="1" placeholder="Number of Tables" value={data.tableCount || ''} onChange={(e) => { const val = parseInt(e.target.value); updateData({ tableCount: isNaN(val) ? 0 : val }); }} className="w-full p-3 border rounded-lg" />
    </StepWrapper>
  );
}

export function Step5() {
  const { data, updateData } = useSetup();
  return (
    <StepWrapper title="Owner Account Setup" description="Create the primary restaurant admin account.">
      <input type="text" placeholder="Owner Name" value={data.admin.name} onChange={(e) => updateData({ admin: {...data.admin, name: e.target.value} })} className="w-full p-3 border rounded-lg" />
      <input type="text" placeholder="Phone" value={data.admin.phone} onChange={(e) => updateData({ admin: {...data.admin, phone: e.target.value} })} className="w-full p-3 border rounded-lg" />
      <input type="password" placeholder="PIN" value={data.admin.pin} onChange={(e) => updateData({ admin: {...data.admin, pin: e.target.value} })} className="w-full p-3 border rounded-lg" />
    </StepWrapper>
  );
}
