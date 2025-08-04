using System.ComponentModel.DataAnnotations;

namespace RandomRecipeGenerator.API.Models.Domain
{
    public class UserFavoriteRecipe
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public required Guid UserId { get; set; }

        [Required]
        public Guid RecipeId { get; set; }

        // When the favorite was added
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User User { get; set; } = null!;
        public Recipe Recipe { get; set; } = null!;
    }
}
