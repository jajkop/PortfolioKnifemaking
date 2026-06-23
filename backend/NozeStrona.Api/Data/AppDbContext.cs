using Microsoft.EntityFrameworkCore;
using NozeStrona.Api.Models;

namespace NozeStrona.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Knife> Knives => Set<Knife>();
    public DbSet<KnifeImage> KnifeImages => Set<KnifeImage>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Knife>(entity =>
        {
            entity.Property(k => k.Name).HasMaxLength(200).IsRequired();
            entity.Property(k => k.Steel).HasMaxLength(200).IsRequired();
            entity.Property(k => k.Handle).HasMaxLength(200).IsRequired();
            entity.Property(k => k.Sheath).HasMaxLength(200).IsRequired();
            entity.Property(k => k.Price).HasPrecision(10, 2);
            entity.Property(k => k.TotalLength).HasPrecision(8, 2);
            entity.Property(k => k.WorkingLength).HasPrecision(8, 2);
            entity.Property(k => k.MaxWidth).HasPrecision(8, 2);
            entity.Property(k => k.Thickness).HasPrecision(8, 2);
        });

        modelBuilder.Entity<KnifeImage>(entity =>
        {
            entity.Property(i => i.FilePath).HasMaxLength(500).IsRequired();
            entity.HasOne(i => i.Knife)
                .WithMany(k => k.Images)
                .HasForeignKey(i => i.KnifeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.Property(u => u.Username).HasMaxLength(100).IsRequired();
        });
    }
}
