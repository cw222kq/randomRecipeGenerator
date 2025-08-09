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

        public Task<bool> RemoveFavoriteAsync(Guid UserId, Guid recipeId)
        {
            throw new NotImplementedException();
        }
    }
}
