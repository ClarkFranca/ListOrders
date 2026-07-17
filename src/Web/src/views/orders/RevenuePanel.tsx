import { RevenueByDay } from './types';
import { DollarSign, ShoppingBag, BarChart2 } from 'lucide-react';

interface RevenuePanelProps {
  data: RevenueByDay[];
  range: { startDate: string; endDate: string };
  onRangeChange: (range: { startDate: string; endDate: string }) => void;
  loading: boolean;
}

export const RevenuePanel = ({ data, range, onRangeChange, loading }: RevenuePanelProps) => {
  const totalRevenue = data.reduce((sum, item) => sum + Number(item.total), 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orderCount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // dateStr e formatado como '2026-06-15' ou '2026-06-15T00:00:00'
    const cleanDateStr = dateStr.split('T')[0];
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
      const [, month, day] = parts;
      return `${day}/${month}`;
    }
    // Fallback caso o formato seja diferente
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const maxTotal = Math.max(...data.map(item => Number(item.total)), 1);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="glass" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data Inicial</label>
          <input
            type="date"
            value={range.startDate}
            onChange={e => onRangeChange({ ...range, startDate: e.target.value })}
            onDoubleClick={() => onRangeChange({ ...range, startDate: '' })}
            style={{ width: 'auto' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data Final</label>
          <input
            type="date"
            value={range.endDate}
            onChange={e => onRangeChange({ ...range, endDate: e.target.value })}
            onDoubleClick={() => onRangeChange({ ...range, endDate: '' })}
            style={{ width: 'auto' }}
          />
        </div>
        {loading && <span style={{ color: 'var(--primary)', fontSize: '0.9rem', marginLeft: 'auto' }}>Carregando faturamento...</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Faturamento Total</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total de Pedidos</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalOrders}</h3>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={18} /> Faturamento Agregado por Dia
        </h4>

        {data.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Sem dados para o período selecionado.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {data.map((day, idx) => {
              const percentage = (Number(day.total) / maxTotal) * 100;
              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formatDate(day.date)}</span>
                  <div style={{ height: '24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary), #6366F1)',
                      borderRadius: '6px'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrency(Number(day.total))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
