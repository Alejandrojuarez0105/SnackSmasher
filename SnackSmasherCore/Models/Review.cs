namespace SnackSmasherCore.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VideogameId { get; set; }
        public int Rating { get; set; } // 1 a 5
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navegación
        public User User { get; set; } = null!;
        public Videogame Videogame { get; set; } = null!;
    }
}