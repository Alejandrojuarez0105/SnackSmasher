namespace SnackSmasherCore.Models
{
    public class MenuCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Navegación
        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    }
}