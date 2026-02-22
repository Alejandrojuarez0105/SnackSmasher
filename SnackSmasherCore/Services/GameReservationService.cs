using Microsoft.EntityFrameworkCore;
using SnackSmasherCore.Data;
using SnackSmasherCore.DTOs;
using SnackSmasherCore.Models;

namespace SnackSmasherCore.Services
{
    public class GameReservationService : IGameReservationService
    {
        private readonly ApplicationDbContext _context;

        public GameReservationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<GameReservationDto>> GetAllReservations()
        {
            return await _context.GameReservations
                .Include(gr => gr.User)
                .Include(gr => gr.Videogame)
                .Select(gr => new GameReservationDto
                {
                    Id = gr.Id,
                    UserId = gr.UserId,
                    Username = gr.User.Username,
                    VideogameId = gr.VideogameId,
                    VideogameTitle = gr.Videogame.Title,
                    ReservationDate = gr.ReservationDate,
                    StartTime = gr.StartTime,
                    EndTime = gr.EndTime,
                    Status = gr.Status,
                    Notes = gr.Notes,
                    CreatedAt = gr.CreatedAt
                })
                .OrderByDescending(gr => gr.ReservationDate)
                .ThenBy(gr => gr.StartTime)
                .ToListAsync();
        }

        public async Task<List<GameReservationDto>> GetReservationsByUser(int userId)
        {
            return await _context.GameReservations
                .Where(gr => gr.UserId == userId)
                .Include(gr => gr.User)
                .Include(gr => gr.Videogame)
                .Select(gr => new GameReservationDto
                {
                    Id = gr.Id,
                    UserId = gr.UserId,
                    Username = gr.User.Username,
                    VideogameId = gr.VideogameId,
                    VideogameTitle = gr.Videogame.Title,
                    ReservationDate = gr.ReservationDate,
                    StartTime = gr.StartTime,
                    EndTime = gr.EndTime,
                    Status = gr.Status,
                    Notes = gr.Notes,
                    CreatedAt = gr.CreatedAt
                })
                .OrderByDescending(gr => gr.ReservationDate)
                .ThenBy(gr => gr.StartTime)
                .ToListAsync();
        }

        public async Task<List<GameReservationDto>> GetReservationsByVideogame(int videogameId)
        {
            return await _context.GameReservations
                .Where(gr => gr.VideogameId == videogameId)
                .Include(gr => gr.User)
                .Include(gr => gr.Videogame)
                .Select(gr => new GameReservationDto
                {
                    Id = gr.Id,
                    UserId = gr.UserId,
                    Username = gr.User.Username,
                    VideogameId = gr.VideogameId,
                    VideogameTitle = gr.Videogame.Title,
                    ReservationDate = gr.ReservationDate,
                    StartTime = gr.StartTime,
                    EndTime = gr.EndTime,
                    Status = gr.Status,
                    Notes = gr.Notes,
                    CreatedAt = gr.CreatedAt
                })
                .OrderByDescending(gr => gr.ReservationDate)
                .ThenBy(gr => gr.StartTime)
                .ToListAsync();
        }

        public async Task<GameReservationDto?> GetReservationById(int id)
        {
            var reservation = await _context.GameReservations
                .Include(gr => gr.User)
                .Include(gr => gr.Videogame)
                .FirstOrDefaultAsync(gr => gr.Id == id);

            if (reservation == null) return null;

            return new GameReservationDto
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                Username = reservation.User.Username,
                VideogameId = reservation.VideogameId,
                VideogameTitle = reservation.Videogame.Title,
                ReservationDate = reservation.ReservationDate,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                Status = reservation.Status,
                Notes = reservation.Notes,
                CreatedAt = reservation.CreatedAt
            };
        }

        public async Task<GameReservationDto?> CreateReservation(int userId, CreateGameReservationDto createDto)
        {
            // Verificar que el juego existe y está disponible
            var videogame = await _context.Videogames.FindAsync(createDto.VideogameId);
            if (videogame == null || videogame.AvailableCopies <= 0)
                return null;

            // Verificar que no haya solapamiento de reservas para ese juego en ese horario
            var hasOverlap = await _context.GameReservations
                .Where(gr => gr.VideogameId == createDto.VideogameId &&
                            gr.ReservationDate == createDto.ReservationDate &&
                            gr.Status == "Active")
                .AnyAsync(gr =>
                    (createDto.StartTime >= gr.StartTime && createDto.StartTime < gr.EndTime) ||
                    (createDto.EndTime > gr.StartTime && createDto.EndTime <= gr.EndTime) ||
                    (createDto.StartTime <= gr.StartTime && createDto.EndTime >= gr.EndTime));

            if (hasOverlap)
                return null; // Hay conflicto de horarios

            var newReservation = new GameReservation
            {
                UserId = userId,
                VideogameId = createDto.VideogameId,
                ReservationDate = createDto.ReservationDate,
                StartTime = createDto.StartTime,
                EndTime = createDto.EndTime,
                Status = "Active",
                Notes = createDto.Notes,
                CreatedAt = DateTime.Now
            };

            _context.GameReservations.Add(newReservation);
            await _context.SaveChangesAsync();

            return await GetReservationById(newReservation.Id);
        }

        public async Task<GameReservationDto?> UpdateReservation(int id, UpdateGameReservationDto updateDto)
        {
            var reservation = await _context.GameReservations.FindAsync(id);
            if (reservation == null) return null;

            if (updateDto.Status != null) reservation.Status = updateDto.Status;
            if (updateDto.Notes != null) reservation.Notes = updateDto.Notes;

            await _context.SaveChangesAsync();

            return await GetReservationById(id);
        }

        public async Task<bool> DeleteReservation(int id)
        {
            var reservation = await _context.GameReservations.FindAsync(id);
            if (reservation == null) return false;

            _context.GameReservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<GameReservationDto>> GetActiveReservations()
        {
            return await _context.GameReservations
                .Where(gr => gr.Status == "Active")
                .Include(gr => gr.User)
                .Include(gr => gr.Videogame)
                .Select(gr => new GameReservationDto
                {
                    Id = gr.Id,
                    UserId = gr.UserId,
                    Username = gr.User.Username,
                    VideogameId = gr.VideogameId,
                    VideogameTitle = gr.Videogame.Title,
                    ReservationDate = gr.ReservationDate,
                    StartTime = gr.StartTime,
                    EndTime = gr.EndTime,
                    Status = gr.Status,
                    Notes = gr.Notes,
                    CreatedAt = gr.CreatedAt
                })
                .OrderBy(gr => gr.ReservationDate)
                .ThenBy(gr => gr.StartTime)
                .ToListAsync();
        }
    }
}