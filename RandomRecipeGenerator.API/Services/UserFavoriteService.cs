using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class UserFavoriteService(IUserFavoriteRepository repository, ILogger<UserFavoriteService> logger) : IUserFavoriteService
    {
        private readonly IUserFavoriteRepository _repository = repository;
        private readonly ILogger<UserFavoriteService> _logger = logger;

        public async Task<UserFavoriteRecipe?> AddFavoriteAsync(Guid userId, Guid recipeId)
        {
            if (userId == Guid.Empty || recipeId == Guid.Empty)
            {
                return null;
            }

            return await _repository.AddFavoriteAsync(userId, recipeId);
        }

        public Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> IsFavoriteAsync(Guid userId, Guid recipeId)
        {
            if (userId == Guid.Empty || recipeId == Guid.Empty)
            {
                return false;
            }

            return await _repository.IsFavoriteAsync(userId, recipeId);
        }

        public async Task<bool> RemoveFavoriteAsync(Guid userId, Guid recipeId)
        {
            if (userId == Guid.Empty || recipeId == Guid.Empty)
            {
                return false;
            }

            return await _repository.RemoveFavoriteAsync(userId, recipeId);
        }
    }
}