using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Services;

namespace SnackSmasherCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventsController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEvents()
        {
            var events = await _eventService.GetAllEvents();
            return Ok(events);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveEvents()
        {
            var events = await _eventService.GetActiveEvents();
            return Ok(events);
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingEvents()
        {
            var events = await _eventService.GetUpcomingEvents();
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            var eventItem = await _eventService.GetEventById(id);
            if (eventItem == null)
                return NotFound(new { message = "Event not found" });

            return Ok(eventItem);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto createDto)
        {
            var result = await _eventService.CreateEvent(createDto);
            if (result == null)
                return BadRequest(new { message = "Failed to create event" });

            return CreatedAtAction(nameof(GetEventById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] UpdateEventDto updateDto)
        {
            var result = await _eventService.UpdateEvent(id, updateDto);
            if (result == null)
                return NotFound(new { message = "Event not found" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var success = await _eventService.DeleteEvent(id);
            if (!success)
                return NotFound(new { message = "Event not found" });

            return NoContent();
        }
    }
}