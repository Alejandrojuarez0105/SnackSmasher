using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class MenuService : IMenuService
    {
        private readonly ApplicationDbContext _context;

        public MenuService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuCategoryDto>> GetAllCategoriesWithItems()
        {
            return await _context.MenuCategories
                .Include(c => c.MenuItems.Where(i => i.IsAvailable))
                .Select(c => new MenuCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Items = c.MenuItems
                        .Where(i => i.IsAvailable)
                        .Select(i => new MenuItemDto
                        {
                            Id = i.Id,
                            Name = i.Name,
                            Description = i.Description,
                            Price = i.Price,
                            ImageUrl = i.ImageUrl,
                            CategoryId = i.CategoryId,
                            CategoryName = c.Name,
                            IsAvailable = i.IsAvailable
                        }).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<MenuItemDto>> GetAllMenuItems()
        {
            return await _context.MenuItems
                .Include(i => i.Category)
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    IsAvailable = i.IsAvailable
                })
                .ToListAsync();
        }

        public async Task<List<MenuItemDto>> GetMenuItemsByCategory(int categoryId)
        {
            return await _context.MenuItems
                .Where(i => i.CategoryId == categoryId)
                .Include(i => i.Category)
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    IsAvailable = i.IsAvailable
                })
                .ToListAsync();
        }

        public async Task<MenuItemDto?> GetMenuItemById(int id)
        {
            var item = await _context.MenuItems
                .Include(i => i.Category)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null) return null;

            return new MenuItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                ImageUrl = item.ImageUrl,
                CategoryId = item.CategoryId,
                CategoryName = item.Category.Name,
                IsAvailable = item.IsAvailable
            };
        }

        public async Task<MenuItemDto?> CreateMenuItem(CreateMenuItemDto createDto)
        {
            // Verificar que la categoría existe
            var category = await _context.MenuCategories.FindAsync(createDto.CategoryId);
            if (category == null) return null;

            var newItem = new MenuItem
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Price = createDto.Price,
                ImageUrl = createDto.ImageUrl,
                CategoryId = createDto.CategoryId,
                IsAvailable = true,
                CreatedAt = DateTime.Now
            };

            _context.MenuItems.Add(newItem);
            await _context.SaveChangesAsync();

            return await GetMenuItemById(newItem.Id);
        }

        public async Task<MenuItemDto?> UpdateMenuItem(int id, UpdateMenuItemDto updateDto)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return null;

            if (updateDto.Name != null) item.Name = updateDto.Name;
            if (updateDto.Description != null) item.Description = updateDto.Description;
            if (updateDto.Price.HasValue) item.Price = updateDto.Price.Value;
            if (updateDto.ImageUrl != null) item.ImageUrl = updateDto.ImageUrl;
            if (updateDto.CategoryId.HasValue)
            {
                // Verificar que la nueva categoría existe
                var categoryExists = await _context.MenuCategories.AnyAsync(c => c.Id == updateDto.CategoryId.Value);
                if (categoryExists)
                    item.CategoryId = updateDto.CategoryId.Value;
            }
            if (updateDto.IsAvailable.HasValue) item.IsAvailable = updateDto.IsAvailable.Value;

            await _context.SaveChangesAsync();

            return await GetMenuItemById(id);
        }

        public async Task<bool> DeleteMenuItem(int id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return false;

            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}