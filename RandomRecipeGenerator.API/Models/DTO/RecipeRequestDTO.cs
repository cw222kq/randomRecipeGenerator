using System.ComponentModel.DataAnnotations;

namespace RandomRecipeGenerator.API.Models.DTO
{
    public class RecipeRequestDTO
    {
        [Required]
        [StringLength(255, MinimumLength =1)]
        public required string Title { get; set; }

        [Required]
        [MinLength(1)]
        public required List<string> Ingredients { get; set; }

        [Required]
        [MinLength(1)]
        public required string Instructions { get; set; }

        [StringLength(1000)]
        public string? ImageUrl { get; set; }
    }
}
