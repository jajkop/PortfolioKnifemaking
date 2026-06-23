namespace NozeStrona.Api.Models;

public class Knife
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Steel { get; set; } = string.Empty;
    public string Handle { get; set; } = string.Empty;
    public string Sheath { get; set; } = "BRAK";
    public decimal TotalLength { get; set; }
    public decimal WorkingLength { get; set; }
    public decimal MaxWidth { get; set; }
    public decimal Thickness { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<KnifeImage> Images { get; set; } = new List<KnifeImage>();
}
