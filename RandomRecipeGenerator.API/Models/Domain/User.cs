using System.ComponentModel.DataAnnotations;

namespace RandomRecipeGenerator.API.Models.Domain
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(255)]
        public required string GoogleUserId { get; set; }

        [Required]
        [StringLength(255)]
        public required string Email { get; set; }

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties - recipes saved/owned by the user
        public ICollection<Recipe> Recipes { get; set; } = [];
    }
}
