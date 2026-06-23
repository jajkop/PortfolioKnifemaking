namespace NozeStrona.Api.DTOs;

public record KnifeListItemDto(
    int Id,
    string Name,
    decimal Price,
    string? MainImageUrl,
    DateTime CreatedAt
);

public record KnifeImageDto(
    int Id,
    string Url,
    bool IsMain,
    int SortOrder
);

public record KnifeDetailDto(
    int Id,
    string Name,
    decimal Price,
    string Steel,
    string Handle,
    string Sheath,
    decimal TotalLength,
    decimal WorkingLength,
    decimal MaxWidth,
    decimal Thickness,
    DateTime CreatedAt,
    IReadOnlyList<KnifeImageDto> Images
);

public record KnifeCreateUpdateDto(
    string Name,
    decimal Price,
    string Steel,
    string Handle,
    string Sheath,
    decimal TotalLength,
    decimal WorkingLength,
    decimal MaxWidth,
    decimal Thickness,
    DateTime? CreatedAt = null
);

public record LoginRequestDto(string Username, string Password);

public record LoginResponseDto(string Token, DateTime ExpiresAt);

public record SetMainImageDto(int ImageId);
