import React, { useState } from 'react';
import { Order } from './types';
import { Eye, EyeOff, Calendar, Package } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
}

export const OrderTable = ({ orders }: OrderTableProps) => {
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadgeStyle = (status: string) => {
    const base = {
      padding: '0.25rem 0.6rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
    };

    switch (status) {
      case 'Pendente':
        return { ...base, backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#F97316', border: '1px solid rgba(249, 115, 22, 0.3)' };
      case 'Faturado':
        return { ...base, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'Processando':
        return { ...base, backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'Processado':
        return { ...base, backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      default:
        return { ...base, backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>Nenhum pedido encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--bg-card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <th style={{ padding: '1rem' }}>ID</th>
            <th style={{ padding: '1rem' }}>Cliente</th>
            <th style={{ padding: '1rem' }}>Data de Criação</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Qtd. de Itens</th>
            <th style={{ padding: '1rem' }}>Valor Total</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const isExpanded = !!expandedOrders[order.id];
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <React.Fragment key={order.id}>
                <tr style={{ 
                  borderBottom: '1px solid var(--bg-card-border)', 
                  transition: 'var(--transition)',
                  backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>#{order.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{order.customerName || 'Sem Cliente'}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={getStatusBadgeStyle(order.status || 'Pendente')}>
                      {order.status || 'Pendente'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {formatCurrency(order.total)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => toggleExpand(order.id)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                        {isExpanded ? 'Esconder' : 'Ver Itens'}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={7} style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>ITENS DO PEDIDO</h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '0.5rem 0',
                              borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                              fontSize: '0.9rem'
                            }}>
                              <span>
                                <strong style={{ color: 'var(--text-main)' }}>{item.product}</strong>
                                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>x{item.quantity}</span>
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {formatCurrency(item.unitPrice)}/un
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
