import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../shared/api';
import { Order, PagedResult, RevenueByDay } from './types';

export function useOrders() {
  const [ordersData, setOrdersData] = useState<PagedResult<Order> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);

  const [orderFilters, setOrderFilters] = useState({
    customerName: '',
    status: '',
    date: ''
  });

  const [revenueData, setRevenueData] = useState<RevenueByDay[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null);
  const [revenueRange, setRevenueRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchOrders = useCallback(async (page: number, size?: number, filters?: { customerName?: string; status?: string; date?: string }) => {
    setLoadingOrders(true);
    setErrorOrders(null);
    const finalSize = size !== undefined ? size : pageSize;
    try {
      let url = `/orders?page=${page}&pageSize=${finalSize}`;
      if (filters) {
        if (filters.customerName) url += `&customerName=${encodeURIComponent(filters.customerName)}`;
        if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
        if (filters.date) url += `&date=${encodeURIComponent(filters.date)}`;
      }
      const data = await apiFetch<PagedResult<Order>>(url);
      setOrdersData(data);
    } catch (err: any) {
      setErrorOrders(err.message || 'Falha ao buscar pedidos');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchRevenue = useCallback(async () => {
    if (!revenueRange.startDate || !revenueRange.endDate) {
      setRevenueData([]);
      setErrorRevenue(null);
      return;
    }
    setLoadingRevenue(true);
    setErrorRevenue(null);
    try {
      const data = await apiFetch<RevenueByDay[]>(
        `/orders/revenue?startDate=${revenueRange.startDate}&endDate=${revenueRange.endDate}`
      );
      setRevenueData(data);
    } catch (err: any) {
      setErrorRevenue(err.message || 'Falha ao buscar faturamento');
    } finally {
      setLoadingRevenue(false);
    }
  }, [revenueRange.startDate, revenueRange.endDate]);

  const createOrder = async (customerName: string, items: { product: string; quantity: number; unitPrice: number }[]) => {
    try {
      await apiFetch<number>('/orders', {
        method: 'POST',
        body: JSON.stringify({ customerName, items }),
      });
      setCurrentPage(1);
      fetchOrders(1);
      fetchRevenue();
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao criar pedido');
    }
  };

  const triggerProcess = async (orderId: number) => {
    try {
      await apiFetch(`/orders/${orderId}/process`, {
        method: 'POST',
      });
      fetchOrders(currentPage);
      fetchRevenue();
    } catch (err: any) {
      console.error('Erro ao processar pedido:', err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchOrders(currentPage);
      fetchRevenue();
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, pageSize, orderFilters);
  }, [currentPage, pageSize, orderFilters, fetchOrders]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return {
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
    refreshOrders: () => fetchOrders(currentPage, pageSize, orderFilters),
    refreshRevenue: fetchRevenue,
  };
}
