using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IMenuService
    {
        Task<List<MenuCategoryDto>> GetAllCategoriesWithItems();
        Task<List<MenuItemDto>> GetAllMenuItems();
        Task<List<MenuItemDto>> GetMenuItemsByCategory(int categoryId);
        Task<MenuItemDto?> GetMenuItemById(int id);
        Task<MenuItemDto?> CreateMenuItem(CreateMenuItemDto createDto);
        Task<MenuItemDto?> UpdateMenuItem(int id, UpdateMenuItemDto updateDto);
        Task<bool> DeleteMenuItem(int id);
    }
}