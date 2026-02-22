namespace SnackSmasherCore.DTOs
{
    public class TableDto
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public int Capacity { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateTableDto
    {
        public int Number { get; set; }
        public int Capacity { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateTableDto
    {
        public int? Number { get; set; }
        public int? Capacity { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }
}