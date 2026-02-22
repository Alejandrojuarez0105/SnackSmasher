namespace SnackSmasherCore.DTOs
{
    public class TableReservationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TableId { get; set; }
        public int TableNumber { get; set; }
        public int TableCapacity { get; set; }
        public DateOnly ReservationDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int GuestCount { get; set; }
        public bool IsMatchEvent { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTableReservationDto
    {
        public int TableId { get; set; }
        public DateOnly ReservationDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int GuestCount { get; set; } = 1;
        public bool IsMatchEvent { get; set; } = false;
        public string? Notes { get; set; }
    }

    public class UpdateTableReservationDto
    {
        public string? Status { get; set; }
        public string? Notes { get; set; }
    }
}