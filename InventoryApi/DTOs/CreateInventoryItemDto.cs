namespace InventoryApi.DTOs;

public class CreateInventoryItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Quantity { get; set; }
}
