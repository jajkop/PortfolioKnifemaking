using Microsoft.EntityFrameworkCore;
using NozeStrona.Api.Data;
using NozeStrona.Api.DTOs;
using NozeStrona.Api.Models;

namespace NozeStrona.Api.Services;

public interface IKnifeService
{
    Task<IReadOnlyList<KnifeListItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<KnifeDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<KnifeDetailDto> CreateAsync(KnifeCreateUpdateDto dto, CancellationToken cancellationToken = default);
    Task<KnifeDetailDto?> UpdateAsync(int id, KnifeCreateUpdateDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<KnifeImageDto?> AddImageAsync(int knifeId, IFormFile file, CancellationToken cancellationToken = default);
    Task<bool> DeleteImageAsync(int knifeId, int imageId, CancellationToken cancellationToken = default);
    Task<KnifeImageDto?> SetMainImageAsync(int knifeId, int imageId, CancellationToken cancellationToken = default);
}

public class KnifeService(AppDbContext db, IFileStorageService fileStorage) : IKnifeService
{
    public async Task<IReadOnlyList<KnifeListItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var knives = await db.Knives
            .AsNoTracking()
            .Include(k => k.Images)
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync(cancellationToken);

        return knives.Select(MapToListItem).ToList();
    }

    public async Task<KnifeDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var knife = await db.Knives
            .AsNoTracking()
            .Include(k => k.Images)
            .FirstOrDefaultAsync(k => k.Id == id, cancellationToken);

        return knife is null ? null : MapToDetail(knife);
    }

    public async Task<KnifeDetailDto> CreateAsync(KnifeCreateUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var knife = new Knife
        {
            Name = dto.Name.Trim(),
            Price = dto.Price,
            Steel = dto.Steel.Trim(),
            Handle = dto.Handle.Trim(),
            Sheath = string.IsNullOrWhiteSpace(dto.Sheath) ? "BRAK" : dto.Sheath.Trim(),
            TotalLength = dto.TotalLength,
            WorkingLength = dto.WorkingLength,
            MaxWidth = dto.MaxWidth,
            Thickness = dto.Thickness,
            CreatedAt = NormalizeCreatedAt(dto.CreatedAt)
        };

        db.Knives.Add(knife);
        await db.SaveChangesAsync(cancellationToken);

        return MapToDetail(knife);
    }

    public async Task<KnifeDetailDto?> UpdateAsync(int id, KnifeCreateUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var knife = await db.Knives
            .Include(k => k.Images)
            .FirstOrDefaultAsync(k => k.Id == id, cancellationToken);

        if (knife is null)
        {
            return null;
        }

        knife.Name = dto.Name.Trim();
        knife.Price = dto.Price;
        knife.Steel = dto.Steel.Trim();
        knife.Handle = dto.Handle.Trim();
        knife.Sheath = string.IsNullOrWhiteSpace(dto.Sheath) ? "BRAK" : dto.Sheath.Trim();
        knife.TotalLength = dto.TotalLength;
        knife.WorkingLength = dto.WorkingLength;
        knife.MaxWidth = dto.MaxWidth;
        knife.Thickness = dto.Thickness;
        if (dto.CreatedAt.HasValue)
        {
            knife.CreatedAt = NormalizeCreatedAt(dto.CreatedAt);
        }
        knife.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        return MapToDetail(knife);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var knife = await db.Knives
            .Include(k => k.Images)
            .FirstOrDefaultAsync(k => k.Id == id, cancellationToken);

        if (knife is null)
        {
            return false;
        }

        foreach (var image in knife.Images)
        {
            fileStorage.DeleteImage(image.FilePath);
        }

        db.Knives.Remove(knife);
        await db.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<KnifeImageDto?> AddImageAsync(int knifeId, IFormFile file, CancellationToken cancellationToken = default)
    {
        var knife = await db.Knives
            .Include(k => k.Images)
            .FirstOrDefaultAsync(k => k.Id == knifeId, cancellationToken);

        if (knife is null)
        {
            return null;
        }

        var relativePath = await fileStorage.SaveImageAsync(file, cancellationToken);
        var isFirstImage = knife.Images.Count == 0;

        var image = new KnifeImage
        {
            KnifeId = knifeId,
            FilePath = relativePath,
            IsMain = isFirstImage,
            SortOrder = knife.Images.Count
        };

        db.KnifeImages.Add(image);
        knife.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return MapImage(image);
    }

    public async Task<bool> DeleteImageAsync(int knifeId, int imageId, CancellationToken cancellationToken = default)
    {
        var image = await db.KnifeImages
            .Include(i => i.Knife)
            .ThenInclude(k => k!.Images)
            .FirstOrDefaultAsync(i => i.Id == imageId && i.KnifeId == knifeId, cancellationToken);

        if (image is null)
        {
            return false;
        }

        var wasMain = image.IsMain;
        fileStorage.DeleteImage(image.FilePath);

        db.KnifeImages.Remove(image);
        await db.SaveChangesAsync(cancellationToken);

        if (wasMain)
        {
            var nextMain = await db.KnifeImages
                .Where(i => i.KnifeId == knifeId)
                .OrderBy(i => i.SortOrder)
                .FirstOrDefaultAsync(cancellationToken);

            if (nextMain is not null)
            {
                nextMain.IsMain = true;
                await db.SaveChangesAsync(cancellationToken);
            }
        }

        return true;
    }

    public async Task<KnifeImageDto?> SetMainImageAsync(int knifeId, int imageId, CancellationToken cancellationToken = default)
    {
        var images = await db.KnifeImages
            .Where(i => i.KnifeId == knifeId)
            .ToListAsync(cancellationToken);

        var target = images.FirstOrDefault(i => i.Id == imageId);
        if (target is null)
        {
            return null;
        }

        foreach (var image in images)
        {
            image.IsMain = image.Id == imageId;
        }

        var knife = await db.Knives.FindAsync([knifeId], cancellationToken);
        if (knife is not null)
        {
            knife.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);

        return MapImage(target);
    }

    private static DateTime NormalizeCreatedAt(DateTime? createdAt)
    {
        var value = createdAt ?? DateTime.UtcNow;
        return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
    }

    private KnifeListItemDto MapToListItem(Knife knife)
    {
        var mainImage = knife.Images.FirstOrDefault(i => i.IsMain) ?? knife.Images.FirstOrDefault();
        return new KnifeListItemDto(
            knife.Id,
            knife.Name,
            knife.Price,
            mainImage is null ? null : fileStorage.GetPublicUrl(mainImage.FilePath),
            knife.CreatedAt
        );
    }

    private KnifeDetailDto MapToDetail(Knife knife)
    {
        return new KnifeDetailDto(
            knife.Id,
            knife.Name,
            knife.Price,
            knife.Steel,
            knife.Handle,
            knife.Sheath,
            knife.TotalLength,
            knife.WorkingLength,
            knife.MaxWidth,
            knife.Thickness,
            knife.CreatedAt,
            knife.Images
                .OrderByDescending(i => i.IsMain)
                .ThenBy(i => i.SortOrder)
                .Select(MapImage)
                .ToList()
        );
    }

    private KnifeImageDto MapImage(KnifeImage image)
    {
        return new KnifeImageDto(
            image.Id,
            fileStorage.GetPublicUrl(image.FilePath),
            image.IsMain,
            image.SortOrder
        );
    }
}
