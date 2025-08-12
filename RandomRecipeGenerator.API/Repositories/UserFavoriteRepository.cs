using Microsoft.EntityFrameworkCore;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public class UserFavoriteRepository(ApplicationDbContext context, ILogger<UserFavoriteRepository> logger) : IUserFavoriteRepository
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<UserFavoriteRepository> _logger = logger;

        public async Task<UserFavoriteRecipe?> AddFavoriteAsync(Guid userId, Guid recipeId)
        {
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for adding favorite.");
                return null;
            }

            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for adding favorite.");
                return null;
            }

            try
            {
                // Check if favorite allready exists
                var existingFavorite = await _context.UserFavoriteRecipes
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.RecipeId == recipeId);

                if (existingFavorite != null)
                {
                    _logger.LogInformation("Favorite recipe {RecipeId} already exists for user {UserId}", recipeId, userId);
                    return null;
                }

                var userFavoriteRecipe = new UserFavoriteRecipe
                {
                    UserId = userId,
                    RecipeId = recipeId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserFavoriteRecipes.Add(userFavoriteRecipe);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Added favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                return userFavoriteRecipe;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                return null;
            }
        }

        public async Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for getting favorites.");
                return [];
            }

            try
            {
                return await _context.UserFavoriteRecipes
                .Where(f => f.UserId == userId)
                .Include(f => f.Recipe)
                .Select(f => f.Recipe)
                .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorites for user {UserId}", userId);
                return [];
            }

        }

        public async Task<bool> IsFavoriteAsync(Guid userId, Guid recipeId)
        {
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for checking favorite.");
                return false;
            }

            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for checking favorite.");
                return false;
            }

            try
            {
                return await _context.UserFavoriteRecipes
                .AnyAsync(f => f.UserId == userId && f.RecipeId == recipeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if recipe {RecipeId} is favorite for user {UserId}", recipeId, userId);
                return false;
            }
        }

        public async Task<bool> RemoveFavoriteAsync(Guid userId, Guid recipeId)
        {
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for removing favorite.");
                return false;
            }

            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for removing favorite.");
                return false;
            }

            try
            {
                // Check if favorite exists
                var favorite = await _context.UserFavoriteRecipes
               .FirstOrDefaultAsync(f => f.UserId == userId && f.RecipeId == recipeId);

                if (favorite == null)
                {
                    _logger.LogInformation("Favorite recipe {RecipeId} not found for user {UserId}", recipeId, userId);
                    return false;
                }

                _context.UserFavoriteRecipes.Remove(favorite);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                return false;
            }
        }
    }
}
