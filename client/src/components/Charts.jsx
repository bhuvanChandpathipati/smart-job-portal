import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { STATUS_COLORS } from '../utils/format';

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
export const ChartCard = ({ title, children, empty }) => (
  <div className="card"><h3 className="mb-4 font-semibold">{title}</h3>
    {empty ? <p className="muted py-12 text-center text-sm">No data to show yet</p> : <div className="h-64">{children}</div>}
  </div>
);

export const StatusPie = ({ data, title = 'Application status' }) => {
  const rows = data.filter((d) => d.value > 0);
  return (
    <ChartCard title={title} empty={!rows.length}>
      <ResponsiveContainer><PieChart>
        <Pie isAnimationActive={false} data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {rows.map((r, i) => <Cell key={r.name} fill={STATUS_COLORS[r.name] || PALETTE[i % 6]} />)}
        </Pie><Tooltip /><Legend />
      </PieChart></ResponsiveContainer>
    </ChartCard>
  );
};

export const SimpleBar = ({ title, data, xKey = 'name', bars }) => (
  <ChartCard title={title} empty={!data.length || data.every((d) => bars.every((b) => !d[b.key]))}>
    <ResponsiveContainer><BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey={xKey} fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
      {bars.length > 1 && <Legend />}
      {bars.map((b, i) => <Bar isAnimationActive={false} key={b.key} dataKey={b.key} name={b.label} fill={b.color || PALETTE[i]} radius={[4, 4, 0, 0]} />)}
    </BarChart></ResponsiveContainer>
  </ChartCard>
);

export const SimpleLine = ({ title, data, lines }) => (
  <ChartCard title={title} empty={!data.length || data.every((d) => lines.every((l) => !d[l.key]))}>
    <ResponsiveContainer><LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="month" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
      {lines.length > 1 && <Legend />}
      {lines.map((l, i) => <Line isAnimationActive={false} key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color || PALETTE[i]} strokeWidth={2} dot />)}
    </LineChart></ResponsiveContainer>
  </ChartCard>
);
