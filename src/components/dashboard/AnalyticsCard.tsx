export default function AnalyticsCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
      <h3 className="text-sm font-medium text-card-foreground/70 uppercase">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-card-foreground">{value}</p>
    </div>
  )
}
