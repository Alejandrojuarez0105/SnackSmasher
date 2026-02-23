using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Services;

namespace SnackSmasherCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategoriesWithItems()
        {
            var categories = await _menuService.GetAllCategoriesWithItems();
            return Ok(categories);
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetAllMenuItems()
        {
            var items = await _menuService.GetAllMenuItems();
            return Ok(items);
        }

        [HttpGet("items/{id}")]
        public async Task<IActionResult> GetMenuItemById(int id)
        {
            var item = await _menuService.GetMenuItemById(id);
            if (item == null)
                return NotFound(new { message = "Menu item not found" });

            return Ok(item);
        }

        [HttpGet("items/category/{categoryId}")]
        public async Task<IActionResult> GetMenuItemsByCategory(int categoryId)
        {
            var items = await _menuService.GetMenuItemsByCategory(categoryId);
            return Ok(items);
        }

        [HttpPost("items")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateMenuItem([FromBody] CreateMenuItemDto createDto)
        {
            var result = await _menuService.CreateMenuItem(createDto);
            if (result == null)
                return BadRequest(new { message = "Category not found or creation failed" });

            return CreatedAtAction(nameof(GetMenuItemById), new { id = result.Id }, result);
        }

        [HttpPut("items/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] UpdateMenuItemDto updateDto)
        {
            var result = await _menuService.UpdateMenuItem(id, updateDto);
            if (result == null)
                return NotFound(new { message = "Menu item not found" });

            return Ok(result);
        }

        [HttpDelete("items/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            var success = await _menuService.DeleteMenuItem(id);
            if (!success)
                return NotFound(new { message = "Menu item not found" });

            return NoContent();
        }
    }
}