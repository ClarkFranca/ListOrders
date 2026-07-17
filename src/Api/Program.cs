using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 15,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null
        )
    ));

builder.Services.AddHttpClient<OrderService>();
builder.Services.AddScoped<OrderService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    int maxRetries = 5;
    int delaySeconds = 3;
    bool dbInitialized = false;

    for (int attempt = 1; attempt <= maxRetries && !dbInitialized; attempt++)
    {
        try
        {
            logger.LogInformation("Inicializando banco de dados... (Tentativa {Attempt} de {MaxRetries})", attempt, maxRetries);
            var context = services.GetRequiredService<AppDbContext>();
            await AppDbContext.SeedAsync(context);
            dbInitialized = true;
            logger.LogInformation("Banco de dados inicializado com sucesso.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Falha na tentativa {Attempt} ao inicializar o banco de dados.", attempt);
            if (attempt == maxRetries)
            {
                logger.LogError(ex, "Erro fatal: nao foi possivel inicializar o banco de dados apos {MaxRetries} tentativas.", maxRetries);
            }
            else
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
    }
}

app.MapControllers();

app.Run();
