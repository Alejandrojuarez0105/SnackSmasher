using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class VideogameService : IVideogameService
    {
        private readonly ApplicationDbContext _context;

        public VideogameService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<VideogameDto>> GetAllVideogames()
        {
            return await _context.Videogames
                .Select(v => new VideogameDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    Description = v.Description,
                    Genre = v.Genre,
                    Platform = v.Platform,
                    IsMultiplayer = v.IsMultiplayer,
                    TotalCopies = v.TotalCopies,
                    AvailableCopies = v.AvailableCopies,
                    MaxSessionMinutes = v.MaxSessionMinutes,
                    ImageUrl = v.ImageUrl,
                    IsAvailable = v.IsAvailable,
                    AverageRating = v.Reviews.Any() ? v.Reviews.Average(r => r.Rating) : null,
                    TotalReviews = v.Reviews.Count
                })
                .ToListAsync();
        }

        public async Task<VideogameDto?> GetVideogameById(int id)
        {
            var videogame = await _context.Videogames
                .Include(v => v.Reviews)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (videogame == null) return null;

            return new VideogameDto
            {
                Id = videogame.Id,
                Title = videogame.Title,
                Description = videogame.Description,
                Genre = videogame.Genre,
                Platform = videogame.Platform,
                IsMultiplayer = videogame.IsMultiplayer,
                TotalCopies = videogame.TotalCopies,
                AvailableCopies = videogame.AvailableCopies,
                MaxSessionMinutes = videogame.MaxSessionMinutes,
                ImageUrl = videogame.ImageUrl,
                IsAvailable = videogame.IsAvailable,
                AverageRating = videogame.Reviews.Any() ? videogame.Reviews.Average(r => r.Rating) : null,
                TotalReviews = videogame.Reviews.Count
            };
        }

        public async Task<VideogameDto?> CreateVideogame(CreateVideogameDto createDto)
        {
            var newVideogame = new Videogame
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Genre = createDto.Genre,
                Platform = createDto.Platform,
                IsMultiplayer = createDto.IsMultiplayer,
                TotalCopies = createDto.TotalCopies,
                AvailableCopies = createDto.TotalCopies,
                MaxSessionMinutes = createDto.MaxSessionMinutes,
                ImageUrl = createDto.ImageUrl,
                IsAvailable = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Videogames.Add(newVideogame);
            await _context.SaveChangesAsync();

            return new VideogameDto
            {
                Id = newVideogame.Id,
                Title = newVideogame.Title,
                Description = newVideogame.Description,
                Genre = newVideogame.Genre,
                Platform = newVideogame.Platform,
                IsMultiplayer = newVideogame.IsMultiplayer,
                TotalCopies = newVideogame.TotalCopies,
                AvailableCopies = newVideogame.AvailableCopies,
                MaxSessionMinutes = newVideogame.MaxSessionMinutes,
                ImageUrl = newVideogame.ImageUrl,
                IsAvailable = newVideogame.IsAvailable,
                AverageRating = null,
                TotalReviews = 0
            };
        }

        public async Task<VideogameDto?> UpdateVideogame(int id, UpdateVideogameDto updateDto)
        {
            var videogame = await _context.Videogames.FindAsync(id);
            if (videogame == null) return null;

            if (updateDto.Title != null) videogame.Title = updateDto.Title;
            if (updateDto.Description != null) videogame.Description = updateDto.Description;
            if (updateDto.Genre != null) videogame.Genre = updateDto.Genre;
            if (updateDto.Platform != null) videogame.Platform = updateDto.Platform;
            if (updateDto.IsMultiplayer.HasValue) videogame.IsMultiplayer = updateDto.IsMultiplayer.Value;
            if (updateDto.TotalCopies.HasValue) videogame.TotalCopies = updateDto.TotalCopies.Value;
            if (updateDto.MaxSessionMinutes.HasValue) videogame.MaxSessionMinutes = updateDto.MaxSessionMinutes.Value;
            if (updateDto.ImageUrl != null) videogame.ImageUrl = updateDto.ImageUrl;
            if (updateDto.IsAvailable.HasValue) videogame.IsAvailable = updateDto.IsAvailable.Value;

            videogame.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return await GetVideogameById(id);
        }

        public async Task<bool> DeleteVideogame(int id)
        {
            var videogame = await _context.Videogames.FindAsync(id);
            if (videogame == null) return false;

            _context.Videogames.Remove(videogame);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<VideogameDto>> GetVideogamesByGenre(string genre)
        {
            return await _context.Videogames
                .Where(v => v.Genre == genre)
                .Select(v => new VideogameDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    Description = v.Description,
                    Genre = v.Genre,
                    Platform = v.Platform,
                    IsMultiplayer = v.IsMultiplayer,
                    TotalCopies = v.TotalCopies,
                    AvailableCopies = v.AvailableCopies,
                    MaxSessionMinutes = v.MaxSessionMinutes,
                    ImageUrl = v.ImageUrl,
                    IsAvailable = v.IsAvailable,
                    AverageRating = v.Reviews.Any() ? v.Reviews.Average(r => r.Rating) : null,
                    TotalReviews = v.Reviews.Count
                })
                .ToListAsync();
        }

        public async Task<List<VideogameDto>> GetVideogamesByPlatform(string platform)
        {
            return await _context.Videogames
                .Where(v => v.Platform == platform)
                .Select(v => new VideogameDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    Description = v.Description,
                    Genre = v.Genre,
                    Platform = v.Platform,
                    IsMultiplayer = v.IsMultiplayer,
                    TotalCopies = v.TotalCopies,
                    AvailableCopies = v.AvailableCopies,
                    MaxSessionMinutes = v.MaxSessionMinutes,
                    ImageUrl = v.ImageUrl,
                    IsAvailable = v.IsAvailable,
                    AverageRating = v.Reviews.Any() ? v.Reviews.Average(r => r.Rating) : null,
                    TotalReviews = v.Reviews.Count
                })
                .ToListAsync();
        }

        public async Task<List<VideogameDto>> GetTopRatedVideogames(int count = 10)
        {
            return await _context.Videogames
                .Where(v => v.Reviews.Any())
                .Select(v => new VideogameDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    Description = v.Description,
                    Genre = v.Genre,
                    Platform = v.Platform,
                    IsMultiplayer = v.IsMultiplayer,
                    TotalCopies = v.TotalCopies,
                    AvailableCopies = v.AvailableCopies,
                    MaxSessionMinutes = v.MaxSessionMinutes,
                    ImageUrl = v.ImageUrl,
                    IsAvailable = v.IsAvailable,
                    AverageRating = v.Reviews.Average(r => r.Rating),
                    TotalReviews = v.Reviews.Count
                })
                .OrderByDescending(v => v.AverageRating)
                .Take(count)
                .ToListAsync();
        }
    }
}