namespace NozeStrona.Api.Models;

public class KnifeImage
{
    public int Id { get; set; }
    public int KnifeId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public bool IsMain { get; set; }
    public int SortOrder { get; set; }

    public Knife Knife { get; set; } = null!;
}
