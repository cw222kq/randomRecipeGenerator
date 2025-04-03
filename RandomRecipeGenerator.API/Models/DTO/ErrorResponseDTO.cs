namespace RandomRecipeGenerator.API.Models.DTO
{
    public class ErrorResponseDTO
    {
        public required string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
