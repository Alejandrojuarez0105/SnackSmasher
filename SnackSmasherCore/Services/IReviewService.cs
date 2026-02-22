using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IReviewService
    {
        Task<List<ReviewDto>> GetAllReviews();
        Task<List<ReviewDto>> GetReviewsByVideogame(int videogameId);
        Task<List<ReviewDto>> GetReviewsByUser(int userId);
        Task<ReviewDto?> GetReviewById(int id);
        Task<ReviewDto?> CreateReview(int userId, CreateReviewDto createDto);
        Task<ReviewDto?> UpdateReview(int id, int userId, UpdateReviewDto updateDto);
        Task<bool> DeleteReview(int id, int userId);
    }
}