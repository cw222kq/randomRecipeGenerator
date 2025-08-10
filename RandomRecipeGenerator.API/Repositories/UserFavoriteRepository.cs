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
            // Check if favorite allready exists
            var existingFavorite = await _context.UserFavoriteRecipes
                .FirstOrDefaultAsync(f => f.UserId == UserId && f.RecipeId == RecipeId);

            if (existingFavorite != null)
            {
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

            return userFavoriteRecipe;
        }

        public Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid UserId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> IsFavoriteAsync(Guid UserId, Guid RecipeId)
        {
            throw new NotImplementedException();
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
