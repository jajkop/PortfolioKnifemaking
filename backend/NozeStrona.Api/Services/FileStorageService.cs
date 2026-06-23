namespace NozeStrona.Api.Services;

public interface IFileStorageService
{
    Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default);
    void DeleteImage(string relativePath);
    string GetPublicUrl(string relativePath);
}

public class FileStorageService(IWebHostEnvironment environment, IConfiguration configuration) : IFileStorageService
{
    private readonly string _uploadRoot = ResolveUploadRoot(environment, configuration);

    private static string ResolveUploadRoot(IWebHostEnvironment environment, IConfiguration configuration)
    {
        var configuredPath = configuration["FileStorage:UploadPath"]
            ?? Path.Combine(environment.ContentRootPath, "uploads");

        return Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.Combine(environment.ContentRootPath, configuredPath);
    }

    public async Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Dozwolone formaty: JPG, PNG, WEBP, GIF.");
        }

        Directory.CreateDirectory(_uploadRoot);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(_uploadRoot, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream, cancellationToken);

        return fileName;
    }

    public void DeleteImage(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return;
        }

        var fullPath = Path.Combine(_uploadRoot, relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    public string GetPublicUrl(string relativePath)
    {
        return $"/uploads/{relativePath}";
    }
}
