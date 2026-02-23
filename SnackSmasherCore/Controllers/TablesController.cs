using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Services;

namespace SnackSmasherCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TablesController : ControllerBase
    {
        private readonly ITableService _tableService;

        public TablesController(ITableService tableService)
        {
            _tableService = tableService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTables()
        {
            var tables = await _tableService.GetAllTables();
            return Ok(tables);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTables()
        {
            var tables = await _tableService.GetActiveTables();
            return Ok(tables);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTableById(int id)
        {
            var table = await _tableService.GetTableById(id);
            if (table == null)
                return NotFound(new { message = "Table not found" });

            return Ok(table);
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableTables(
            [FromQuery] string date,
            [FromQuery] string startTime,
            [FromQuery] string endTime)
        {
            if (!DateOnly.TryParse(date, out var parsedDate))
                return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD" });

            if (!TimeOnly.TryParse(startTime, out var parsedStartTime))
                return BadRequest(new { message = "Invalid start time format. Use HH:mm" });

            if (!TimeOnly.TryParse(endTime, out var parsedEndTime))
                return BadRequest(new { message = "Invalid end time format. Use HH:mm" });

            var tables = await _tableService.GetAvailableTablesForDateTime(parsedDate, parsedStartTime, parsedEndTime);
            return Ok(tables);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTable([FromBody] CreateTableDto createDto)
        {
            var result = await _tableService.CreateTable(createDto);
            if (result == null)
                return BadRequest(new { message = "Table number already exists" });

            return CreatedAtAction(nameof(GetTableById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTable(int id, [FromBody] UpdateTableDto updateDto)
        {
            var result = await _tableService.UpdateTable(id, updateDto);
            if (result == null)
                return NotFound(new { message = "Table not found or number already exists" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTable(int id)
        {
            var success = await _tableService.DeleteTable(id);
            if (!success)
                return NotFound(new { message = "Table not found" });

            return NoContent();
        }
    }
}