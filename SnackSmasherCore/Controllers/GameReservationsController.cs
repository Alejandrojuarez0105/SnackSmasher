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
    public class GameReservationsController : ControllerBase
    {
        private readonly IGameReservationService _gameReservationService;

        public GameReservationsController(IGameReservationService gameReservationService)
        {
            _gameReservationService = gameReservationService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _gameReservationService.GetAllReservations();
            return Ok(reservations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservationById(int id)
        {
            var reservation = await _gameReservationService.GetReservationById(id);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            return Ok(reservation);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReservationsByUser(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && currentUserId != userId)
                return Forbid();

            var reservations = await _gameReservationService.GetReservationsByUser(userId);
            return Ok(reservations);
        }

        [HttpGet("videogame/{videogameId}")]
        public async Task<IActionResult> GetReservationsByVideogame(int videogameId)
        {
            var reservations = await _gameReservationService.GetReservationsByVideogame(videogameId);
            return Ok(reservations);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveReservations()
        {
            var reservations = await _gameReservationService.GetActiveReservations();
            return Ok(reservations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateGameReservationDto createDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _gameReservationService.CreateReservation(userId, createDto);

            if (result == null)
                return BadRequest(new { message = "Game not available or time slot already taken" });

            return CreatedAtAction(nameof(GetReservationById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] UpdateGameReservationDto updateDto)
        {
            var result = await _gameReservationService.UpdateReservation(id, updateDto);
            if (result == null)
                return NotFound(new { message = "Reservation not found" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var success = await _gameReservationService.DeleteReservation(id);
            if (!success)
                return NotFound(new { message = "Reservation not found" });

            return NoContent();
        }
    }
}