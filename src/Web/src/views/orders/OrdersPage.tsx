import React, { useState } from 'react';
import { useOrders } from './useOrders';
import { OrderTable } from './OrderTable';
import { CreateOrderForm } from './CreateOrderForm';
import { RevenuePanel } from './RevenuePanel';
import { Pagination } from '../../shared/Pagination';
import { Modal } from '../../shared/Modal';
import { Package, BarChart3, Plus } from 'lucide-react';

export const OrdersPage = () => {
  const {
    ordersData,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    loadingOrders,
    errorOrders,
    revenueData,
    loadingRevenue,
    errorRevenue,
    revenueRange,
    setRevenueRange,
    orderFilters,
    setOrderFilters,
    createOrder,
    triggerProcess,
    updateOrderStatus,
    refreshOrders
  } = useOrders();

  const [activeTab, setActiveTab] = useState<'orders' | 'revenue'>('orders');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States para o Simulador de Status
  const [targetOrderId, setTargetOrderId] = useState('');
  const [targetStatus, setTargetStatus] = useState('Faturado');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);
    const id = parseInt(targetOrderId, 10);
    if (isNaN(id)) {
      setFeedbackMessage({ text: 'Por favor, insira um ID de pedido válido.', type: 'error' });
      return;
    }

    setUpdatingStatus(true);
    try {
      if (targetStatus === 'Faturado') {
        await updateOrderStatus(id, 'Faturado');
        setFeedbackMessage({ text: `Pedido #${id} faturado com sucesso!`, type: 'success' });
      } else if (targetStatus === 'Processado') {
        await triggerProcess(id);
        setFeedbackMessage({ text: `Processamento do pedido #${id} iniciado via Node.js!`, type: 'success' });
      }
      setTargetOrderId('');
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Erro ao atualizar status.', type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Limpar mensagem de sucesso após 5 segundos
  React.useEffect(() => {
    if (feedbackMessage?.type === 'success') {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Agendamento opcional para atualizar pedidos em andamento
  React.useEffect(() => {
    let interval: any;
    if (ordersData?.items.some(o => o.status === 'Pendente' || o.status === 'Processando' || o.status === 'Faturado')) {
      interval = setInterval(() => {
        refreshOrders();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [ordersData, refreshOrders]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ListOrders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gestão de pedidos e acompanhamento de faturamento.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Novo Pedido
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '0.5rem' }}>
        <button
          className="btn"
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'transparent',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : 'none',
            borderRadius: '0',
            padding: '0.5rem 1rem'
          }}
        >
          <Package size={18} />
          Pedidos
        </button>
        <button
          className="btn"
          onClick={() => setActiveTab('revenue')}
          style={{
            background: 'transparent',
            color: activeTab === 'revenue' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'revenue' ? '2px solid var(--primary)' : 'none',
            borderRadius: '0',
            padding: '0.5rem 1rem'
          }}
        >
          <BarChart3 size={18} />
          Faturamento
        </button>
      </div>

      <div>
        {activeTab === 'orders' ? (
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
            {/* Simulador de Transições de Status */}
            <div className="glass" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Simulador de Transições de Status (POC)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Esta ferramenta demonstra a comunicação entre o Dotnet e o processador Node.js, validando que um pedido só pode ser processado se passar antes pelo status de <strong>Faturado</strong>.
              </p>
              
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: '0.4rem', flex: '1 1 200px' }}>
                  <label htmlFor="sim-order-id" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID do Pedido</label>
                  <input
                    id="sim-order-id"
                    type="text"
                    placeholder="Ex: 15002"
                    value={targetOrderId}
                    onChange={(e) => setTargetOrderId(e.target.value)}
                    onDoubleClick={() => setTargetOrderId('')}
                    style={{
                      padding: '0.5rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--bg-card-border)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gap: '0.4rem', flex: '1 1 200px' }}>
                  <label htmlFor="sim-status" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Novo Status Desejado</label>
                  <select
                    id="sim-status"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    style={{
                      padding: '0.5rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--bg-card-border)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="Faturado" style={{ background: '#111827' }}>Faturado (API Dotnet)</option>
                    <option value="Processado" style={{ background: '#111827' }}>Processado (Processador Node)</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingStatus}
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: updatingStatus ? 'var(--text-muted)' : 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {updatingStatus ? 'Processando...' : 'Atualizar Status'}
                </button>
              </form>

              {feedbackMessage && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  backgroundColor: feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: feedbackMessage.type === 'success' ? '#34D399' : '#F87171',
                  border: feedbackMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {feedbackMessage.text}
                </div>
              )}
            </div>

            {/* Painel de Filtros da Lista de Pedidos */}
            <div className="glass" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 200px' }}>
                <label htmlFor="filter-customer" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtrar por Cliente</label>
                <input
                  id="filter-customer"
                  type="text"
                  placeholder="Nome do cliente..."
                  value={orderFilters.customerName}
                  onChange={e => setOrderFilters({ ...orderFilters, customerName: e.target.value })}
                  onDoubleClick={() => setOrderFilters({ ...orderFilters, customerName: '' })}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 150px' }}>
                <label htmlFor="filter-status" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtrar por Status</label>
                <select
                  id="filter-status"
                  value={orderFilters.status}
                  onChange={e => setOrderFilters({ ...orderFilters, status: e.target.value })}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="" style={{ background: '#111827' }}>Todos os Status</option>
                  <option value="Pendente" style={{ background: '#111827' }}>Pendente</option>
                  <option value="Faturado" style={{ background: '#111827' }}>Faturado</option>
                  <option value="Processando" style={{ background: '#111827' }}>Processando</option>
                  <option value="Processado" style={{ background: '#111827' }}>Processado</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 150px' }}>
                <label htmlFor="filter-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtrar por Data</label>
                <input
                  id="filter-date"
                  type="date"
                  value={orderFilters.date}
                  onChange={e => setOrderFilters({ ...orderFilters, date: e.target.value })}
                  onDoubleClick={() => setOrderFilters({ ...orderFilters, date: '' })}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setOrderFilters({ customerName: '', status: '', date: '' })}
                style={{ alignSelf: 'flex-end', padding: '0.45rem 1rem', fontSize: '0.9rem' }}
              >
                Limpar Filtros
              </button>
            </div>

            <div className="glass" style={{ padding: '1.5rem' }}>
              {errorOrders && (
                <div style={{ padding: '1rem', color: 'var(--danger)', textAlign: 'center' }}>
                  Erro: {errorOrders}
                </div>
              )}
              {loadingOrders && !ordersData ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Carregando pedidos...
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {/* Top Pagination & Page Size Selector */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={ordersData?.totalPages || 1}
                      onPageChange={setCurrentPage}
                    />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label htmlFor="page-size-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Exibir:</label>
                      <select
                        id="page-size-select"
                        value={pageSize}
                        onChange={e => {
                          setPageSize(parseInt(e.target.value, 10));
                          setCurrentPage(1); // Resetar para página 1
                        }}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--bg-card-border)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="10" style={{ background: '#111827' }}>10 pedidos</option>
                        <option value="50" style={{ background: '#111827' }}>50 pedidos</option>
                        <option value="100" style={{ background: '#111827' }}>100 pedidos</option>
                        <option value="500" style={{ background: '#111827' }}>500 pedidos</option>
                      </select>
                    </div>
                  </div>

                  <OrderTable 
                    orders={ordersData?.items || []} 
                  />

                  {/* Bottom Pagination */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={ordersData?.totalPages || 1}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {errorRevenue && (
              <div style={{ padding: '1rem', color: 'var(--danger)', textAlign: 'center' }}>
                Erro: {errorRevenue}
              </div>
            )}
            <RevenuePanel
              data={revenueData}
              range={revenueRange}
              onRangeChange={setRevenueRange}
              loading={loadingRevenue}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Criar Novo Pedido">
        <CreateOrderForm
          onSubmit={createOrder}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
