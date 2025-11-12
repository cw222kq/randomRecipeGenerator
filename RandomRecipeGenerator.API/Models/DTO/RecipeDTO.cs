namespace RandomRecipeGenerator.API.Models.DTO
{
    public class RecipeDTO
    {
        public Guid Id { get; set; }
        public int? SpoonucularId { get; set; }
        public required string Title { get; set; }
        public required List<string> Ingredients { get; set; }
        public required string Instructions { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid? UserId { get; set; }
    }
}
