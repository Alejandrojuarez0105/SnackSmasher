namespace SnackSmasherCore.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int VideogameId { get; set; }
        public string VideogameTitle { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReviewDto
    {
        public int VideogameId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class UpdateReviewDto
    {
        public int? Rating { get; set; }
        public string? Comment { get; set; }
    }
}