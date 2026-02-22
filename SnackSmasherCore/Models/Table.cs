namespace SnackSmasherCore.Models
{
    public class Table
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public int Capacity { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        // Navegación
        public ICollection<TableReservation> TableReservations { get; set; } = new List<TableReservation>();
    }
}