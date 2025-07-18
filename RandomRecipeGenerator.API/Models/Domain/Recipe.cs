using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RandomRecipeGenerator.API.Models.Domain
{
    public class Recipe
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public required int SpoonacularId { get; set; }

        [Required]
        [StringLength(255)]
        public required string Title { get; set; }

        [Required]
        public required List<string> Ingredients { get; set; }

        [Required]
        [Column(TypeName = "text")]
        public required string Instructions { get; set; }

        [StringLength(1000)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Optional - null for temporary recipes, set for saved recipes, ToDo: Create different models for temp and saved recipes
        public Guid? UserId { get; set; }

        public virtual User? User { get; set; }
    }
}
