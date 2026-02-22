namespace SnackSmasherCore.Models
{
    public class TableReservation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TableId { get; set; }
        public DateOnly ReservationDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int GuestCount { get; set; } = 1;
        public bool IsMatchEvent { get; set; } = false;
        public string? Notes { get; set; }
        public string Status { get; set; } = "Confirmed"; // Confirmed, Cancelled, Completed
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navegación
        public User User { get; set; } = null!;
        public Table Table { get; set; } = null!;
    }
}