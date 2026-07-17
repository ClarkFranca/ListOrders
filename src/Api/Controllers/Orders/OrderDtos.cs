using System;
using System.Collections.Generic;

namespace Api.Controllers.Orders;

public record CreateOrderRequest(string CustomerName, List<CreateOrderItemRequest> Items);
public record CreateOrderItemRequest(string Product, int Quantity, decimal UnitPrice);

public record OrderResponse(
    int Id,
    string CustomerName,
    string Status,
    DateTime CreatedAt,
    decimal Total,
    List<OrderItemDto> Items);

public record OrderItemDto(string Product, int Quantity, decimal UnitPrice);

public record UpdateStatusRequest(string Status);
