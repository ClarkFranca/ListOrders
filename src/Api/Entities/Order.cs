using System;
using System.Collections.Generic;

namespace Api.Entities;

public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Status { get; set; } = "Pendente";
    public DateTime CreatedAt { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}
