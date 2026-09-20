export interface Stat {
  label: string;
  value: string;
  accent?: boolean;
}

export default function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-strip">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <div className="label">{s.label}</div>
          <div className={`value tabular${s.accent ? ' accent' : ''}`}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}
