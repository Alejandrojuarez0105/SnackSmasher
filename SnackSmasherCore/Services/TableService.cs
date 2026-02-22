using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class TableService : ITableService
    {
        private readonly ApplicationDbContext _context;

        public TableService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TableDto>> GetAllTables()
        {
            return await _context.Tables
                .Select(t => new TableDto
                {
                    Id = t.Id,
                    Number = t.Number,
                    Capacity = t.Capacity,
                    Description = t.Description,
                    IsActive = t.IsActive
                })
                .OrderBy(t => t.Number)
                .ToListAsync();
        }

        public async Task<List<TableDto>> GetActiveTables()
        {
            return await _context.Tables
                .Where(t => t.IsActive)
                .Select(t => new TableDto
                {
                    Id = t.Id,
                    Number = t.Number,
                    Capacity = t.Capacity,
                    Description = t.Description,
                    IsActive = t.IsActive
                })
                .OrderBy(t => t.Number)
                .ToListAsync();
        }

        public async Task<TableDto?> GetTableById(int id)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null) return null;

            return new TableDto
            {
                Id = table.Id,
                Number = table.Number,
                Capacity = table.Capacity,
                Description = table.Description,
                IsActive = table.IsActive
            };
        }

        public async Task<TableDto?> CreateTable(CreateTableDto createDto)
        {
            // Verificar que el número de mesa no existe
            if (await _context.Tables.AnyAsync(t => t.Number == createDto.Number))
                return null;

            var newTable = new Table
            {
                Number = createDto.Number,
                Capacity = createDto.Capacity,
                Description = createDto.Description,
                IsActive = true
            };

            _context.Tables.Add(newTable);
            await _context.SaveChangesAsync();

            return new TableDto
            {
                Id = newTable.Id,
                Number = newTable.Number,
                Capacity = newTable.Capacity,
                Description = newTable.Description,
                IsActive = newTable.IsActive
            };
        }

        public async Task<TableDto?> UpdateTable(int id, UpdateTableDto updateDto)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null) return null;

            if (updateDto.Number.HasValue)
            {
                // Verificar que el nuevo número no existe ya en otra mesa
                var numberExists = await _context.Tables
                    .AnyAsync(t => t.Number == updateDto.Number.Value && t.Id != id);
                if (numberExists)
                    return null;

                table.Number = updateDto.Number.Value;
            }
            if (updateDto.Capacity.HasValue) table.Capacity = updateDto.Capacity.Value;
            if (updateDto.Description != null) table.Description = updateDto.Description;
            if (updateDto.IsActive.HasValue) table.IsActive = updateDto.IsActive.Value;

            await _context.SaveChangesAsync();

            return new TableDto
            {
                Id = table.Id,
                Number = table.Number,
                Capacity = table.Capacity,
                Description = table.Description,
                IsActive = table.IsActive
            };
        }

        public async Task<bool> DeleteTable(int id)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null) return false;

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TableDto>> GetAvailableTablesForDateTime(DateOnly date, TimeOnly startTime, TimeOnly endTime)
        {
            // Obtener todas las mesas activas
            var allActiveTables = await _context.Tables
                .Where(t => t.IsActive)
                .ToListAsync();

            // Obtener los IDs de las mesas que tienen reservas confirmadas en ese horario
            var busyTableIds = await _context.TableReservations
                .Where(tr => tr.ReservationDate == date &&
                            tr.Status == "Confirmed" &&
                            ((startTime >= tr.StartTime && startTime < tr.EndTime) ||
                             (endTime > tr.StartTime && endTime <= tr.EndTime) ||
                             (startTime <= tr.StartTime && endTime >= tr.EndTime)))
                .Select(tr => tr.TableId)
                .Distinct()
                .ToListAsync();

            // Filtrar las mesas disponibles
            var availableTables = allActiveTables
                .Where(t => !busyTableIds.Contains(t.Id))
                .Select(t => new TableDto
                {
                    Id = t.Id,
                    Number = t.Number,
                    Capacity = t.Capacity,
                    Description = t.Description,
                    IsActive = t.IsActive
                })
                .OrderBy(t => t.Number)
                .ToList();

            return availableTables;
        }
    }
}