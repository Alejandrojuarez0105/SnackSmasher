using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace SnackSmasherCore.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int Role { get; set; } = 2; // 1=Admin, 2=Usuario
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;

        // Navegación
        public ICollection<GameReservation> GameReservations { get; set; } = new List<GameReservation>();
        public ICollection<TableReservation> TableReservations { get; set; } = new List<TableReservation>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}