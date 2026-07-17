using System;

namespace Api.Controllers.Orders;

public record RevenueByDayResponse(DateOnly Date, decimal Total, long OrderCount);
