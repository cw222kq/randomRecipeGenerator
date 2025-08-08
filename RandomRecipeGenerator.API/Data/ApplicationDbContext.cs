using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {

        // DbSets properties - represent tables in db
        public DbSet<User> Users { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<UserFavoriteRecipe> UserFavoriteRecipes { get; set; }


        // OnModelCreating method - configure entity relationships, constraints, etc.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity config
            modelBuilder.Entity<User>(entity =>
            {
                // Ensure GoogleUserId is unique across all users
                entity.HasIndex(u => u.GoogleUserId).IsUnique();

                entity.HasIndex(u => u.Email).IsUnique();

                // Auto-update UpdatedAt on any change
                entity.Property(u => u.UpdatedAt)
                    .ValueGeneratedOnUpdate();
            });

            // Recipe entity config
            modelBuilder.Entity<Recipe>(entity =>
            {
                // Ensure SpoonacularId is unique (prevent duplicate saves)
                entity.HasIndex(r => r.SpoonacularId).IsUnique();

                // Auto-update UpdatedAt on any change
                entity.Property(r => r.UpdatedAt)
                    .ValueGeneratedOnUpdate();

                // Configure relationship with User
                entity.HasOne(r => r.User)
                    .WithMany(u => u.Recipes)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade); // Delete all user's recipes when user is deleted
            });

            // UserFavoriteRecipe entity config
            modelBuilder.Entity<UserFavoriteRecipe>(entity =>
            {
                entity.HasIndex(ufr => new { ufr.UserId, ufr.RecipeId }).IsUnique();

                // Configure User relationship
                entity.HasOne(ufr => ufr.User)
                    .WithMany(u => u.FavoriteRecipes)
                    .HasForeignKey(ufr => ufr.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Configure Recipe relationship
                entity.HasOne(ufr => ufr.Recipe)
                    .WithMany(r => r.UserFavoriteRecipes)
                    .HasForeignKey(ufr => ufr.RecipeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            
        }

    }
}
