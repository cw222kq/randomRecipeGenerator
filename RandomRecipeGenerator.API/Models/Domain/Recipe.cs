using System.Text.Json.Serialization;

namespace RandomRecipeGenerator.API.Models.Domain
{
    public class Recipe
    {
        public Guid Id { get; set; }
        public  required int SpoonacularId { get; set; }
        public required string Title { get; set; }
        public required List<string> Ingredients { get; set; }
        public required string Instructions { get; set; }
        public string? ImageUrl { get; set; }
    }
}
