using Microsoft.EntityFrameworkCore;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public class RecipeRepository(ApplicationDbContext context, ILogger<RecipeRepository> logger) : IRecipeRepository
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<RecipeRepository> _logger = logger;
        public async Task<Recipe?> CreateRecipeAsync(Recipe recipe)
        {
            if (string.IsNullOrWhiteSpace(recipe.Title))
            {
                _logger.LogError("Recipe title cannot be empty for creation");
                return null;
                
            }

            if (recipe.UserId == null || recipe.UserId == Guid.Empty)
            {
                _logger.LogError("Recipe must have a valid user Id for creation.");
                return null;
            }

            try
            {
                recipe.CreatedAt = DateTime.UtcNow;
                recipe.UpdatedAt = DateTime.UtcNow;

                _context.Recipes.Add(recipe);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created recipe {RecipeId} for user {UserId}", recipe.Id, recipe.UserId);
                return recipe;
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Error creating recipe for user {UserId}", recipe.UserId);
                return null;
            }   
        }

        public async Task<bool> DeleteRecipeAsync(Guid id)
        {
            if (id == Guid.Empty) 
            {
                _logger.LogError("Recipe ID cannot be empty for deletion");
                return false;
            }

            try
            {
                var recipe = await _context.Recipes.FindAsync(id);
                if (recipe == null)
                {
                    _logger.LogWarning("Recipe {RecipeId} not found for deletion", id);
                    return false;
                }

                _context.Recipes.Remove(recipe);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted recipe {RecipeId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting recipe {RecipeId}", id);
                return false;
            }       
        }

        public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
        {
            return await _context.Recipes
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId)
        {
            return await _context.Recipes
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.UpdatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId)
        {
            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for ownership check");
                return false;
            }

            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for ownnership check");
                return false;
            }

            try
            {
                return await _context.Recipes
                .AnyAsync(r => r.Id == recipeId && r.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking recipe ownership for recipe {RecipeId} and user {UserId}", recipeId, userId);
                return false;
            }      
        }

        public async Task<Recipe?> UpdateRecipeAsync(Recipe recipe)
        {
            if (recipe.Id == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for update.");
                return null;
            }

            if (string.IsNullOrWhiteSpace(recipe.Title))
            {
                _logger.LogError("Recipe title cannot be empty for update.");
                return null;
            }

            try
            {
                var existingRecipe = await _context.Recipes.FindAsync(recipe.Id);
                if (existingRecipe == null)
                {
                    _logger.LogWarning("Recipe {RecipeId} not found for update", recipe.Id);
                    return null;
                }

                // Update fields
                existingRecipe.Title = recipe.Title;
                existingRecipe.Ingredients = recipe.Ingredients;
                existingRecipe.Instructions = recipe.Instructions;
                existingRecipe.ImageUrl = recipe.ImageUrl;
                existingRecipe.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated recipe {RecipeId}", recipe.Id);
                return existingRecipe;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating recipe {RecipeId}", recipe.Id);
                return null;
            }   
        }
    }
}
