using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace SnackSmasherCore.Models
{
    public class Videogame
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public bool IsMultiplayer { get; set; } = false;
        public int TotalCopies { get; set; } = 1;
        public int AvailableCopies { get; set; } = 1;
        public int MaxSessionMinutes { get; set; } = 60;
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navegación
        public ICollection<GameReservation> GameReservations { get; set; } = new List<GameReservation>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}