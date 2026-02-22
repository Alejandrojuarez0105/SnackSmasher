using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface IGameReservationService
    {
        Task<List<GameReservationDto>> GetAllReservations();
        Task<List<GameReservationDto>> GetReservationsByUser(int userId);
        Task<List<GameReservationDto>> GetReservationsByVideogame(int videogameId);
        Task<GameReservationDto?> GetReservationById(int id);
        Task<GameReservationDto?> CreateReservation(int userId, CreateGameReservationDto createDto);
        Task<GameReservationDto?> UpdateReservation(int id, UpdateGameReservationDto updateDto);
        Task<bool> DeleteReservation(int id);
        Task<List<GameReservationDto>> GetActiveReservations();
    }
}