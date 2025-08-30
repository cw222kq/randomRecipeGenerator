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
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null) 
            {
                return false;
            }

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return true;
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
            return await _context.Recipes
                .AnyAsync(r => r.Id == recipeId && r.UserId == userId);
        }

        public async Task<Recipe?> UpdateRecipeAsync(Recipe recipe)
        {
            var existingRecipe = await _context.Recipes.FindAsync(recipe.Id);
            if (existingRecipe == null)
            {
                return null;
            }

            existingRecipe.Title = recipe.Title;
            existingRecipe.Ingredients = recipe.Ingredients;
            existingRecipe.Instructions = recipe.Instructions;
            existingRecipe.ImageUrl = recipe.ImageUrl;
            existingRecipe.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingRecipe;
        }
    }
}
