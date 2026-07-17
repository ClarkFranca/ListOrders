using Microsoft.AspNetCore.Mvc;
using Api.Services;
using Api.Shared;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers.Orders;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _service;

    public OrdersController(OrderService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderResponse>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? customerName = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? date = null)
        => Ok(await _service.ListAsync(page, pageSize, customerName, status, date));

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            return BadRequest("Nome do cliente e obrigatorio.");

        if (request.Items is null || request.Items.Count == 0)
            return BadRequest("Pedido deve ter ao menos um item.");

        var order = await _service.CreateAsync(request);
        return Created($"/api/orders/{order.Id}", order.Id);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var success = await _service.UpdateStatusAsync(id, request.Status);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/process")]
    public async Task<ActionResult> TriggerProcess(int id)
    {
        try
        {
            await _service.TriggerProcessingAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<List<RevenueByDayResponse>>> Revenue(
        [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        => Ok(await _service.GetRevenueAsync(startDate, endDate));
}
