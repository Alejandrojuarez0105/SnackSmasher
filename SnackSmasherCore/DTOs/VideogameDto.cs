namespace SnackSmasherCore.DTOs
{
    public class VideogameDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public bool IsMultiplayer { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public int MaxSessionMinutes { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
        public double? AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }

    public class CreateVideogameDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public bool IsMultiplayer { get; set; }
        public int TotalCopies { get; set; } = 1;
        public int MaxSessionMinutes { get; set; } = 60;
        public string? ImageUrl { get; set; }
    }

    public class UpdateVideogameDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Genre { get; set; }
        public string? Platform { get; set; }
        public bool? IsMultiplayer { get; set; }
        public int? TotalCopies { get; set; }
        public int? MaxSessionMinutes { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsAvailable { get; set; }
    }
}