using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class UserFavoriteService(IUserFavoriteRepository repository, ILogger<UserFavoriteService> logger) : IUserFavoriteService
    {
        private readonly IUserFavoriteRepository _repository = repository;
        private readonly ILogger<UserFavoriteService> _logger = logger;

        public Task<UserFavoriteRecipe?> AddFavoriteAsync(Guid userId, Guid recipeId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> IsFavoriteAsync(Guid userId, Guid recipeId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> RemoveFavoriteAsync(Guid userId, Guid recipeId)
        {
            throw new NotImplementedException();
        }
    }
}