namespace NozeStrona.Api.Models;

public class AdminUser
{
    public int Id { get; set; }
    public string Username { get; set; } = "admin";
    public string PasswordHash { get; set; } = string.Empty;
}
