namespace SnackSmasherCore.DTOs
{
    public class GameReservationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int VideogameId { get; set; }
        public string VideogameTitle { get; set; } = string.Empty;
        public DateOnly ReservationDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateGameReservationDto
    {
        public int VideogameId { get; set; }
        public DateOnly ReservationDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateGameReservationDto
    {
        public string? Status { get; set; }
        public string? Notes { get; set; }
    }
}