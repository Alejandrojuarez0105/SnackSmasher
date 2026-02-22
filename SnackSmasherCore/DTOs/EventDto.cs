namespace SnackSmasherCore.DTOs
{
    public class EventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateOnly EventDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateOnly EventDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateEventDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateOnly? EventDate { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }
}