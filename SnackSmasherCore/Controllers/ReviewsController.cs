using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Services;
using System.Security.Claims;

namespace SnackSmasherCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _reviewService.GetAllReviews();
            return Ok(reviews);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewById(int id)
        {
            var review = await _reviewService.GetReviewById(id);
            if (review == null)
                return NotFound(new { message = "Review not found" });

            return Ok(review);
        }

        [HttpGet("videogame/{videogameId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByVideogame(int videogameId)
        {
            var reviews = await _reviewService.GetReviewsByVideogame(videogameId);
            return Ok(reviews);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReviewsByUser(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");

            // Solo admin o el mismo usuario pueden ver sus reseñas
            if (!isAdmin && currentUserId != userId)
                return Forbid();

            var reviews = await _reviewService.GetReviewsByUser(userId);
            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto createDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.CreateReview(userId, createDto);

            if (result == null)
                return BadRequest(new { message = "Review already exists for this game or creation failed" });

            return CreatedAtAction(nameof(GetReviewById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto updateDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.UpdateReview(id, userId, updateDto);

            if (result == null)
                return NotFound(new { message = "Review not found or you don't have permission" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _reviewService.DeleteReview(id, userId);

            if (!success)
                return NotFound(new { message = "Review not found or you don't have permission" });

            return NoContent();
        }
    }
}