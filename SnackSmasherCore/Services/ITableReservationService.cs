using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface ITableReservationService
    {
        Task<List<TableReservationDto>> GetAllReservations();
        Task<List<TableReservationDto>> GetReservationsByUser(int userId);
        Task<List<TableReservationDto>> GetReservationsByTable(int tableId);
        Task<TableReservationDto?> GetReservationById(int id);
        Task<TableReservationDto?> CreateReservation(int userId, CreateTableReservationDto createDto);
        Task<TableReservationDto?> UpdateReservation(int id, UpdateTableReservationDto updateDto);
        Task<bool> DeleteReservation(int id);
        Task<List<TableReservationDto>> GetReservationsByDate(DateOnly date);
    }
}