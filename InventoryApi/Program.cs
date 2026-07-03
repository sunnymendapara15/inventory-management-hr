using InventoryApi.Data;
using InventoryApi.DTOs;
using InventoryApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=inventory.db";
builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");

app.MapGet("/api/inventory", async (InventoryDbContext db) =>
    await db.InventoryItems.OrderBy(i => i.Name).ToListAsync());

app.MapPost("/api/inventory", async (CreateInventoryItemDto dto, InventoryDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name))
    {
        return Results.BadRequest(new { error = "Name is required." });
    }

    if (dto.Quantity < 0)
    {
        return Results.BadRequest(new { error = "Quantity cannot be negative." });
    }

    var item = new InventoryItem
    {
        Name = dto.Name.Trim(),
        Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
        Quantity = dto.Quantity
    };

    db.InventoryItems.Add(item);
    await db.SaveChangesAsync();

    return Results.Created($"/api/inventory/{item.Id}", item);
});

app.MapPatch("/api/inventory/{id}/quantity", async (int id, AdjustQuantityDto dto, InventoryDbContext db) =>
{
    var item = await db.InventoryItems.FindAsync(id);
    if (item == null)
    {
        return Results.NotFound(new { error = "Item not found." });
    }

    if (dto.NewQuantity.HasValue)
    {
        if (dto.NewQuantity.Value < 0)
        {
            return Results.BadRequest(new { error = "Quantity cannot be negative." });
        }

        item.Quantity = dto.NewQuantity.Value;
    }
    else if (dto.Adjustment.HasValue)
    {
        var updated = item.Quantity + dto.Adjustment.Value;
        if (updated < 0)
        {
            return Results.BadRequest(new { error = "Resulting quantity cannot be negative." });
        }

        item.Quantity = updated;
    }
    else
    {
        return Results.BadRequest(new { error = "Either newQuantity or adjustment is required." });
    }

    await db.SaveChangesAsync();
    return Results.Ok(item);
});

app.Run();
