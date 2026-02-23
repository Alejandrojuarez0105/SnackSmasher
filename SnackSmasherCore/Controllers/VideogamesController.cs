using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Services;

namespace SnackSmasherCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideogamesController : ControllerBase
    {
        private readonly IVideogameService _videogameService;

        public VideogamesController(IVideogameService videogameService)
        {
            _videogameService = videogameService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVideogames()
        {
            var videogames = await _videogameService.GetAllVideogames();
            return Ok(videogames);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVideogameById(int id)
        {
            var videogame = await _videogameService.GetVideogameById(id);
            if (videogame == null)
                return NotFound(new { message = "Videogame not found" });

            return Ok(videogame);
        }

        [HttpGet("genre/{genre}")]
        public async Task<IActionResult> GetVideogamesByGenre(string genre)
        {
            var videogames = await _videogameService.GetVideogamesByGenre(genre);
            return Ok(videogames);
        }

        [HttpGet("platform/{platform}")]
        public async Task<IActionResult> GetVideogamesByPlatform(string platform)
        {
            var videogames = await _videogameService.GetVideogamesByPlatform(platform);
            return Ok(videogames);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRatedVideogames([FromQuery] int count = 10)
        {
            var videogames = await _videogameService.GetTopRatedVideogames(count);
            return Ok(videogames);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateVideogame([FromBody] CreateVideogameDto createDto)
        {
            var result = await _videogameService.CreateVideogame(createDto);
            if (result == null)
                return BadRequest(new { message = "Failed to create videogame" });

            return CreatedAtAction(nameof(GetVideogameById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateVideogame(int id, [FromBody] UpdateVideogameDto updateDto)
        {
            var result = await _videogameService.UpdateVideogame(id, updateDto);
            if (result == null)
                return NotFound(new { message = "Videogame not found" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVideogame(int id)
        {
            var success = await _videogameService.DeleteVideogame(id);
            if (!success)
                return NotFound(new { message = "Videogame not found" });

            return NoContent();
        }
    }
}