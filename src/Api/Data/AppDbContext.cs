using Microsoft.EntityFrameworkCore;
using Api.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.HasMany(o => o.Items)
             .WithOne(i => i.Order)
             .HasForeignKey(i => i.OrderId);
            
            e.HasIndex(o => o.CreatedAt);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
        });
    }

    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (context.Orders.Any()) return;

        var random = new Random();
        var products = new[] { "Notebook", "Teclado", "Mouse", "Monitor", "Fone de Ouvido", "Suporte Articulado", "Webcam", "Cabo HDMI" };
        var prices = new[] { 4500.00m, 150.00m, 80.00m, 1200.00m, 250.00m, 180.00m, 300.00m, 40.00m };
        var customerNames = new[] { 
            "João Silva", "Maria Santos", "Pedro Souza", "Ana Oliveira", "Carlos Lima", 
            "Julia Pereira", "Marcos Costa", "Beatriz Rodrigues", "Lucas Almeida", "Camila Nascimento",
            "Gabriel Araujo", "Larissa Carvalho", "Felipe Melo", "Amanda Gomes", "Thiago Martins",
            "Fernanda Rocha", "Bruno Ribeiro", "Aline Alves", "Rodrigo Cardoso", "Juliana Santana"
        };

        var startDate = DateTime.UtcNow.AddDays(-90);
        var orders = new List<Order>();

        for (int i = 0; i < 15000; i++)
        {
            var orderDate = startDate.AddMinutes(random.Next(0, 90 * 24 * 60));
            var order = new Order 
            { 
                CreatedAt = orderDate,
                CustomerName = customerNames[random.Next(customerNames.Length)],
                Status = "Processado"
            };

            int itemCount = random.Next(1, 5);
            var selectedProducts = new HashSet<int>();

            for (int j = 0; j < itemCount; j++)
            {
                int productIndex;
                do
                {
                    productIndex = random.Next(products.Length);
                } while (selectedProducts.Contains(productIndex));
                selectedProducts.Add(productIndex);

                order.Items.Add(new OrderItem
                {
                    ProductName = products[productIndex],
                    Quantity = random.Next(1, 4),
                    UnitPrice = prices[productIndex]
                });
            }

            orders.Add(order);
        }

        int batchSize = 5000;
        for (int i = 0; i < orders.Count; i += batchSize)
        {
            var batch = orders.Skip(i).Take(batchSize).ToList();
            context.Orders.AddRange(batch);
            await context.SaveChangesAsync();
        }
    }
}
