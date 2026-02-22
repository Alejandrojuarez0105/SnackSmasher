using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace SnackSmasherCore.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets - representan las tablas
        public DbSet<User> Users { get; set; }
        public DbSet<Videogame> Videogames { get; set; }
        public DbSet<GameReservation> GameReservations { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<TableReservation> TableReservations { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<MenuCategory> MenuCategories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Event> Events { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =============================================
            // CONFIGURACIÓN: Users
            // =============================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.FirstName).HasMaxLength(100);
                entity.Property(e => e.LastName).HasMaxLength(100);
                entity.Property(e => e.Role).HasDefaultValue(2);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasIndex(e => e.Username).IsUnique();
            });

            // =============================================
            // CONFIGURACIÓN: Videogames
            // =============================================
            modelBuilder.Entity<Videogame>(entity =>
            {
                entity.ToTable("Videogames");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Genre).IsRequired().HasMaxLength(80);
                entity.Property(e => e.Platform).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IsMultiplayer).HasDefaultValue(false);
                entity.Property(e => e.TotalCopies).HasDefaultValue(1);
                entity.Property(e => e.AvailableCopies).HasDefaultValue(1);
                entity.Property(e => e.MaxSessionMinutes).HasDefaultValue(60);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.IsAvailable).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Genre);
                entity.HasIndex(e => e.Platform);
            });

            // =============================================
            // CONFIGURACIÓN: GameReservations
            // =============================================
            modelBuilder.Entity<GameReservation>(entity =>
            {
                entity.ToTable("GameReservations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.Notes).HasMaxLength(300);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.GameReservations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Videogame)
                    .WithMany(v => v.GameReservations)
                    .HasForeignKey(e => e.VideogameId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.VideogameId);
                entity.HasIndex(e => e.ReservationDate);
                entity.HasIndex(e => e.Status);
            });

            // =============================================
            // CONFIGURACIÓN: Tables
            // =============================================
            modelBuilder.Entity<Table>(entity =>
            {
                entity.ToTable("Tables");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Number).IsRequired();
                entity.Property(e => e.Capacity).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasIndex(e => e.Number).IsUnique();
            });

            // =============================================
            // CONFIGURACIÓN: TableReservations
            // =============================================
            modelBuilder.Entity<TableReservation>(entity =>
            {
                entity.ToTable("TableReservations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.GuestCount).HasDefaultValue(1);
                entity.Property(e => e.IsMatchEvent).HasDefaultValue(false);
                entity.Property(e => e.Notes).HasMaxLength(300);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Confirmed");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.TableReservations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Table)
                    .WithMany(t => t.TableReservations)
                    .HasForeignKey(e => e.TableId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.TableId);
                entity.HasIndex(e => new { e.ReservationDate, e.TableId });
            });

            // =============================================
            // CONFIGURACIÓN: Reviews
            // =============================================
            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("Reviews");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Comment).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Reviews)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Videogame)
                    .WithMany(v => v.Reviews)
                    .HasForeignKey(e => e.VideogameId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasIndex(e => e.VideogameId);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => new { e.UserId, e.VideogameId }).IsUnique();
            });

            // =============================================
            // CONFIGURACIÓN: MenuCategories
            // =============================================
            modelBuilder.Entity<MenuCategory>(entity =>
            {
                entity.ToTable("MenuCategories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(80);
                entity.Property(e => e.Description).HasMaxLength(200);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            // =============================================
            // CONFIGURACIÓN: MenuItems
            // =============================================
            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.ToTable("MenuItems");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(300);
                entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.IsAvailable).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.MenuItems)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.CategoryId);
            });

            // =============================================
            // CONFIGURACIÓN: Events
            // =============================================
            modelBuilder.Entity<Event>(entity =>
            {
                entity.ToTable("Events");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(400);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });
        }
    }
}