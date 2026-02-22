using SnackSmasherCore.DTOs;

namespace SnackSmasherCore.Services
{
    public interface ITableService
    {
        Task<List<TableDto>> GetAllTables();
        Task<List<TableDto>> GetActiveTables();
        Task<TableDto?> GetTableById(int id);
        Task<TableDto?> CreateTable(CreateTableDto createDto);
        Task<TableDto?> UpdateTable(int id, UpdateTableDto updateDto);
        Task<bool> DeleteTable(int id);
        Task<List<TableDto>> GetAvailableTablesForDateTime(DateOnly date, TimeOnly startTime, TimeOnly endTime);
    }
}