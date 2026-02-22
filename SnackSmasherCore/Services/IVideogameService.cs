using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IVideogameService
    {
        Task<List<VideogameDto>> GetAllVideogames();
        Task<VideogameDto?> GetVideogameById(int id);
        Task<VideogameDto?> CreateVideogame(CreateVideogameDto createDto);
        Task<VideogameDto?> UpdateVideogame(int id, UpdateVideogameDto updateDto);
        Task<bool> DeleteVideogame(int id);
        Task<List<VideogameDto>> GetVideogamesByGenre(string genre);
        Task<List<VideogameDto>> GetVideogamesByPlatform(string platform);
        Task<List<VideogameDto>> GetTopRatedVideogames(int count = 10);
    }
}