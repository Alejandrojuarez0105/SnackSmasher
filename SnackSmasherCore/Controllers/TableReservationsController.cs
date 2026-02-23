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
    public class TableReservationsController : ControllerBase
    {
        private readonly ITableReservationService _tableReservationService;

        public TableReservationsController(ITableReservationService tableReservationService)
        {
            _tableReservationService = tableReservationService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _tableReservationService.GetAllReservations();
            return Ok(reservations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservationById(int id)
        {
            var reservation = await _tableReservationService.GetReservationById(id);
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

            var reservations = await _tableReservationService.GetReservationsByUser(userId);
            return Ok(reservations);
        }

        [HttpGet("table/{tableId}")]
        public async Task<IActionResult> GetReservationsByTable(int tableId)
        {
            var reservations = await _tableReservationService.GetReservationsByTable(tableId);
            return Ok(reservations);
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetReservationsByDate(string date)
        {
            if (!DateOnly.TryParse(date, out var parsedDate))
                return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD" });

            var reservations = await _tableReservationService.GetReservationsByDate(parsedDate);
            return Ok(reservations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateTableReservationDto createDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _tableReservationService.CreateReservation(userId, createDto);

            if (result == null)
                return BadRequest(new { message = "Table not available, exceeds capacity, or time slot already taken" });

            return CreatedAtAction(nameof(GetReservationById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] UpdateTableReservationDto updateDto)
        {
            var result = await _tableReservationService.UpdateReservation(id, updateDto);
            if (result == null)
                return NotFound(new { message = "Reservation not found" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var success = await _tableReservationService.DeleteReservation(id);
            if (!success)
                return NotFound(new { message = "Reservation not found" });

            return NoContent();
        }
    }
}