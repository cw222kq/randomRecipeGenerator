using Microsoft.EntityFrameworkCore;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public class UserFavoriteRepository(ApplicationDbContext context, ILogger<UserFavoriteRepository> logger) : IUserFavoriteRepository
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<UserFavoriteRepository> _logger = logger;

        public async Task<UserFavoriteRecipe?> AddFavoriteAsync(Guid UserId, Guid RecipeId)
        {
            if (UserId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for adding favorite.");
                return null;
            }

            if (RecipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for adding favorite.");
                return null;
            }

            try
            {
                // Check if favorite allready exists
                var existingFavorite = await _context.UserFavoriteRecipes
                    .FirstOrDefaultAsync(f => f.UserId == UserId && f.RecipeId == RecipeId);

                if (existingFavorite != null)
                {
                    _logger.LogInformation("Favorite recipe {RecipeId} already exists for user {UserId}", RecipeId, UserId);
                    return null;
                }

                var userFavoriteRecipe = new UserFavoriteRecipe
                {
                    UserId = UserId,
                    RecipeId = RecipeId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserFavoriteRecipes.Add(userFavoriteRecipe);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Added favorite recipe {RecipeId} for user {UserId}", RecipeId, UserId);
                return userFavoriteRecipe;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite recipe {RecipeId} for user {UserId}", RecipeId, UserId);
                return null;
            }
        }

        public async Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid UserId)
        {
            return await _context.UserFavoriteRecipes
                .Where(f => f.UserId == UserId)
                .Include(f => f.Recipe)
                .Select(f => f.Recipe)
                .ToListAsync();
        }

        public async Task<bool> IsFavoriteAsync(Guid UserId, Guid RecipeId)
        {
            return await _context.UserFavoriteRecipes
                .AnyAsync(f => f.UserId == UserId && f.RecipeId == RecipeId);
        }

        public async Task<bool> RemoveFavoriteAsync(Guid UserId, Guid recipeId)
        {
            var favorite = await _context.UserFavoriteRecipes
                .FirstOrDefaultAsync(f => f.UserId == UserId && f.RecipeId == recipeId);

            if (favorite == null)
            {
                return false;
            }

            _context.UserFavoriteRecipes.Remove(favorite);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
