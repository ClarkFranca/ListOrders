using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Entities;
using Api.Shared;
using Api.Controllers.Orders;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Json;

namespace Api.Services;

public class OrderService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _httpClient;
    private readonly string _orderProcessorUrl;

    public OrderService(AppDbContext db, HttpClient httpClient, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _db = db;
        _httpClient = httpClient;
        _orderProcessorUrl = configuration["OrderProcessorUrl"] ?? "http://localhost:3000";
    }

    public async Task<PagedResult<OrderResponse>> ListAsync(
        int page,
        int pageSize,
        string? customerName = null,
        string? status = null,
        DateTime? date = null)
    {
        IQueryable<Order> query = _db.Orders;

        if (!string.IsNullOrWhiteSpace(customerName))
        {
            query = query.Where(o => EF.Functions.ILike(o.CustomerName, $"%{customerName}%"));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (date.HasValue)
        {
            var start = date.Value.Date;
            var end = start.AddDays(1);
            query = query.Where(o => o.CreatedAt >= start && o.CreatedAt < end);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderResponse(
                o.Id,
                o.CustomerName,
                o.Status,
                o.CreatedAt,
                o.Items.Sum(i => i.Quantity * i.UnitPrice),
                o.Items.Select(i => new OrderItemDto(
                    i.ProductName, i.Quantity, i.UnitPrice
                )).ToList()
            ))
            .ToListAsync();

        return new PagedResult<OrderResponse>(items, total, page, pageSize);
    }

    public async Task<Order> CreateAsync(CreateOrderRequest request)
    {
        var order = new Order
        {
            CustomerName = request.CustomerName,
            Status = "Pendente",
            CreatedAt = DateTime.UtcNow,
            Items = request.Items.Select(i => new OrderItem
            {
                ProductName = i.Product,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return order;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return false;

        // Validação de regras de transição de status
        if (status == "Faturado" && order.Status != "Pendente")
        {
            throw new InvalidOperationException("Um pedido só pode ser Faturado se o status atual for Pendente.");
        }
        if (status == "Processando" && order.Status != "Faturado")
        {
            throw new InvalidOperationException("Um pedido só pode iniciar o Processamento se o status atual for Faturado.");
        }
        if (status == "Processado" && order.Status != "Processando")
        {
            throw new InvalidOperationException("Um pedido só pode ser finalizado como Processado se o status atual for Processando.");
        }

        order.Status = status;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task TriggerProcessingAsync(int id)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null)
        {
            throw new InvalidOperationException("Pedido não encontrado.");
        }

        if (order.Status != "Faturado")
        {
            throw new InvalidOperationException("O pedido precisa estar Faturado antes de ser processado.");
        }

        order.Status = "Processando";
        await _db.SaveChangesAsync();

        await NotifyOrderCreatedAsync(id);
    }

    public async Task<List<RevenueByDayResponse>> GetRevenueAsync(DateTime startDate, DateTime endDate)
    {
        var normalizedStartDate = startDate.Date;
        var normalizedEndDate = endDate.Date.AddDays(1).AddTicks(-1);

        using var conn = _db.Database.GetDbConnection();
        var result = await conn.QueryAsync<RevenueByDayResponse>("""
            SELECT CAST(o."CreatedAt" AS DATE) AS "Date",
                   SUM(oi."Quantity" * oi."UnitPrice") AS "Total",
                   COUNT(DISTINCT o."Id") AS "OrderCount"
            FROM "Orders" o
            JOIN "OrderItems" oi ON oi."OrderId" = o."Id"
            WHERE o."CreatedAt" >= @normalizedStartDate AND o."CreatedAt" <= @normalizedEndDate
            GROUP BY CAST(o."CreatedAt" AS DATE)
            ORDER BY "Date"
            """, new { normalizedStartDate = normalizedStartDate, normalizedEndDate = normalizedEndDate });

        return result.ToList();
    }

    private async Task NotifyOrderCreatedAsync(int orderId)
    {
        try
        {
            var payload = new { orderId };
            await _httpClient.PostAsJsonAsync($"{_orderProcessorUrl}/orders/process", payload);
        }
        catch
        {
            // Ignora erro caso o microserviço Node opcional esteja desligado
        }
    }
}
