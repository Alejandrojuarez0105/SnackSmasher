using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;

        public ReviewService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReviewDto>> GetAllReviews()
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Videogame)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Username = r.User.Username,
                    VideogameId = r.VideogameId,
                    VideogameTitle = r.Videogame.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<ReviewDto>> GetReviewsByVideogame(int videogameId)
        {
            return await _context.Reviews
                .Where(r => r.VideogameId == videogameId)
                .Include(r => r.User)
                .Include(r => r.Videogame)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Username = r.User.Username,
                    VideogameId = r.VideogameId,
                    VideogameTitle = r.Videogame.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<ReviewDto>> GetReviewsByUser(int userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.User)
                .Include(r => r.Videogame)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Username = r.User.Username,
                    VideogameId = r.VideogameId,
                    VideogameTitle = r.Videogame.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<ReviewDto?> GetReviewById(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Videogame)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null) return null;

            return new ReviewDto
            {
                Id = review.Id,
                UserId = review.UserId,
                Username = review.User.Username,
                VideogameId = review.VideogameId,
                VideogameTitle = review.Videogame.Title,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<ReviewDto?> CreateReview(int userId, CreateReviewDto createDto)
        {
            // Verificar si el usuario ya tiene una reseña para este juego
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.VideogameId == createDto.VideogameId);

            if (existingReview != null)
                return null; // Ya existe una reseña

            var newReview = new Review
            {
                UserId = userId,
                VideogameId = createDto.VideogameId,
                Rating = createDto.Rating,
                Comment = createDto.Comment,
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(newReview);
            await _context.SaveChangesAsync();

            return await GetReviewById(newReview.Id);
        }

        public async Task<ReviewDto?> UpdateReview(int id, int userId, UpdateReviewDto updateDto)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null || review.UserId != userId)
                return null;

            if (updateDto.Rating.HasValue) review.Rating = updateDto.Rating.Value;
            if (updateDto.Comment != null) review.Comment = updateDto.Comment;

            await _context.SaveChangesAsync();

            return await GetReviewById(id);
        }

        public async Task<bool> DeleteReview(int id, int userId)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null || review.UserId != userId)
                return false;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}