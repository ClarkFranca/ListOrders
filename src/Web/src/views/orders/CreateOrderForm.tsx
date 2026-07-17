import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface CreateOrderFormProps {
  onSubmit: (customerName: string, items: { product: string; quantity: number; unitPrice: number }[]) => Promise<void>;
  onSuccess: () => void;
}

export const CreateOrderForm = ({ onSubmit, onSuccess }: CreateOrderFormProps) => {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, unitPrice: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError('Por favor, insira o nome do cliente.');
      return;
    }

    if (items.some(i => !i.product.trim() || i.quantity <= 0 || i.unitPrice < 0)) {
      setError('Por favor, preencha todos os campos dos itens corretamente.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(customerName, items);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar o pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      {error && (
        <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <label htmlFor="customerName" style={{ fontWeight: '500', fontSize: '0.95rem' }}>Nome do Cliente</label>
        <input
          id="customerName"
          type="text"
          placeholder="Ex: João Silva"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          onDoubleClick={() => setCustomerName('')}
          required
        />
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <label style={{ fontWeight: '500', fontSize: '0.95rem' }}>Itens do Pedido</label>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr auto', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Produto"
                value={item.product}
                onChange={e => handleChange(idx, 'product', e.target.value)}
                onDoubleClick={() => handleChange(idx, 'product', '')}
                required
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              />
              <input
                type="number"
                placeholder="Qtd."
                min="1"
                value={item.quantity}
                onChange={e => handleChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                onDoubleClick={() => handleChange(idx, 'quantity', '')}
                required
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              />
              <input
                type="number"
                placeholder="Preço (R$)"
                step="0.01"
                min="0"
                value={item.unitPrice || ''}
                onChange={e => handleChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                onDoubleClick={() => handleChange(idx, 'unitPrice', '')}
                required
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleRemoveItem(idx)}
                disabled={items.length === 1}
                style={{ padding: '0.5rem', color: 'var(--danger)', opacity: items.length === 1 ? 0.3 : 1 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={handleAddItem}>
          <Plus size={18} />
          Adicionar Item
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <Save size={18} />
          {submitting ? 'Salvando...' : 'Salvar Pedido'}
        </button>
      </div>
    </form>
  );
};
