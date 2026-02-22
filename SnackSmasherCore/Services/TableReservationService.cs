using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class TableReservationService : ITableReservationService
    {
        private readonly ApplicationDbContext _context;

        public TableReservationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TableReservationDto>> GetAllReservations()
        {
            return await _context.TableReservations
                .Include(tr => tr.User)
                .Include(tr => tr.Table)
                .Select(tr => new TableReservationDto
                {
                    Id = tr.Id,
                    UserId = tr.UserId,
                    Username = tr.User.Username,
                    TableId = tr.TableId,
                    TableNumber = tr.Table.Number,
                    TableCapacity = tr.Table.Capacity,
                    ReservationDate = tr.ReservationDate,
                    StartTime = tr.StartTime,
                    EndTime = tr.EndTime,
                    GuestCount = tr.GuestCount,
                    IsMatchEvent = tr.IsMatchEvent,
                    Notes = tr.Notes,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt
                })
                .OrderByDescending(tr => tr.ReservationDate)
                .ThenBy(tr => tr.StartTime)
                .ToListAsync();
        }

        public async Task<List<TableReservationDto>> GetReservationsByUser(int userId)
        {
            return await _context.TableReservations
                .Where(tr => tr.UserId == userId)
                .Include(tr => tr.User)
                .Include(tr => tr.Table)
                .Select(tr => new TableReservationDto
                {
                    Id = tr.Id,
                    UserId = tr.UserId,
                    Username = tr.User.Username,
                    TableId = tr.TableId,
                    TableNumber = tr.Table.Number,
                    TableCapacity = tr.Table.Capacity,
                    ReservationDate = tr.ReservationDate,
                    StartTime = tr.StartTime,
                    EndTime = tr.EndTime,
                    GuestCount = tr.GuestCount,
                    IsMatchEvent = tr.IsMatchEvent,
                    Notes = tr.Notes,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt
                })
                .OrderByDescending(tr => tr.ReservationDate)
                .ThenBy(tr => tr.StartTime)
                .ToListAsync();
        }

        public async Task<List<TableReservationDto>> GetReservationsByTable(int tableId)
        {
            return await _context.TableReservations
                .Where(tr => tr.TableId == tableId)
                .Include(tr => tr.User)
                .Include(tr => tr.Table)
                .Select(tr => new TableReservationDto
                {
                    Id = tr.Id,
                    UserId = tr.UserId,
                    Username = tr.User.Username,
                    TableId = tr.TableId,
                    TableNumber = tr.Table.Number,
                    TableCapacity = tr.Table.Capacity,
                    ReservationDate = tr.ReservationDate,
                    StartTime = tr.StartTime,
                    EndTime = tr.EndTime,
                    GuestCount = tr.GuestCount,
                    IsMatchEvent = tr.IsMatchEvent,
                    Notes = tr.Notes,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt
                })
                .OrderByDescending(tr => tr.ReservationDate)
                .ThenBy(tr => tr.StartTime)
                .ToListAsync();
        }

        public async Task<TableReservationDto?> GetReservationById(int id)
        {
            var reservation = await _context.TableReservations
                .Include(tr => tr.User)
                .Include(tr => tr.Table)
                .FirstOrDefaultAsync(tr => tr.Id == id);

            if (reservation == null) return null;

            return new TableReservationDto
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                Username = reservation.User.Username,
                TableId = reservation.TableId,
                TableNumber = reservation.Table.Number,
                TableCapacity = reservation.Table.Capacity,
                ReservationDate = reservation.ReservationDate,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                GuestCount = reservation.GuestCount,
                IsMatchEvent = reservation.IsMatchEvent,
                Notes = reservation.Notes,
                Status = reservation.Status,
                CreatedAt = reservation.CreatedAt
            };
        }

        public async Task<TableReservationDto?> CreateReservation(int userId, CreateTableReservationDto createDto)
        {
            // Verificar que la mesa existe y está activa
            var table = await _context.Tables.FindAsync(createDto.TableId);
            if (table == null || !table.IsActive)
                return null;

            // Verificar capacidad
            if (createDto.GuestCount > table.Capacity)
                return null;

            // Verificar que no haya solapamiento de reservas para esa mesa en ese horario
            var hasOverlap = await _context.TableReservations
                .Where(tr => tr.TableId == createDto.TableId &&
                            tr.ReservationDate == createDto.ReservationDate &&
                            tr.Status == "Confirmed")
                .AnyAsync(tr =>
                    (createDto.StartTime >= tr.StartTime && createDto.StartTime < tr.EndTime) ||
                    (createDto.EndTime > tr.StartTime && createDto.EndTime <= tr.EndTime) ||
                    (createDto.StartTime <= tr.StartTime && createDto.EndTime >= tr.EndTime));

            if (hasOverlap)
                return null; // Hay conflicto de horarios

            var newReservation = new TableReservation
            {
                UserId = userId,
                TableId = createDto.TableId,
                ReservationDate = createDto.ReservationDate,
                StartTime = createDto.StartTime,
                EndTime = createDto.EndTime,
                GuestCount = createDto.GuestCount,
                IsMatchEvent = createDto.IsMatchEvent,
                Notes = createDto.Notes,
                Status = "Confirmed",
                CreatedAt = DateTime.Now
            };

            _context.TableReservations.Add(newReservation);
            await _context.SaveChangesAsync();

            return await GetReservationById(newReservation.Id);
        }

        public async Task<TableReservationDto?> UpdateReservation(int id, UpdateTableReservationDto updateDto)
        {
            var reservation = await _context.TableReservations.FindAsync(id);
            if (reservation == null) return null;

            if (updateDto.Status != null) reservation.Status = updateDto.Status;
            if (updateDto.Notes != null) reservation.Notes = updateDto.Notes;

            await _context.SaveChangesAsync();

            return await GetReservationById(id);
        }

        public async Task<bool> DeleteReservation(int id)
        {
            var reservation = await _context.TableReservations.FindAsync(id);
            if (reservation == null) return false;

            _context.TableReservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TableReservationDto>> GetReservationsByDate(DateOnly date)
        {
            return await _context.TableReservations
                .Where(tr => tr.ReservationDate == date)
                .Include(tr => tr.User)
                .Include(tr => tr.Table)
                .Select(tr => new TableReservationDto
                {
                    Id = tr.Id,
                    UserId = tr.UserId,
                    Username = tr.User.Username,
                    TableId = tr.TableId,
                    TableNumber = tr.Table.Number,
                    TableCapacity = tr.Table.Capacity,
                    ReservationDate = tr.ReservationDate,
                    StartTime = tr.StartTime,
                    EndTime = tr.EndTime,
                    GuestCount = tr.GuestCount,
                    IsMatchEvent = tr.IsMatchEvent,
                    Notes = tr.Notes,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt
                })
                .OrderBy(tr => tr.StartTime)
                .ToListAsync();
        }
    }
}