namespace SnackSmasherCore.Models
{
    public class GameReservation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VideogameId { get; set; }
        public DateOnly ReservationDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Status { get; set; } = "Active"; // Active, Completed, Cancelled
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navegación
        public User User { get; set; } = null!;
        public Videogame Videogame { get; set; } = null!;
    }
}