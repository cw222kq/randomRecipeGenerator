namespace RandomRecipeGenerator.API.Models.Domain
{
    public class Recipe
    {
        public Guid Id { get; set; }
        public  required int SpoonacularId { get; set; }
        public required string Name { get; set; }
        public required string Ingredients { get; set; }
        public required string Instructions { get; set; }
        public string? ImageUrl { get; set; }
    }
}
