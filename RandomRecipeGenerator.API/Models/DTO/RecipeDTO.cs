namespace RandomRecipeGenerator.API.Models.DTO
{
    public class RecipeDTO
    {
        public required string Name { get; set; }
        public required string Ingredients { get; set; }
        public required string Instructions { get; set; }
        public string? ImageUrl { get; set; }
    }
}
