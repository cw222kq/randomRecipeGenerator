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
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for adding favorite.");
                return null;
            }

            if (recipeId == Guid.Empty)
            {
                _logger.LogWarning("Recipe ID cannot be empty for adding favorite.");
                return null;
            }

            _logger.LogInformation("Adding favorite recipe {RecipeId} for user {UserId}", recipeId, userId);

            try
            {
                var result = await _repository.AddFavoriteAsync(userId, recipeId);

                if (result != null)
                {
                    _logger.LogInformation("Successfully added favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                }
                else
                {
                    _logger.LogWarning("Failed to add favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                }

                return result;
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
                return [];
            }

            return await _repository.GetUserFavoritesAsync(userId);
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
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for removing favorite.");
                return false;
            }

            if (recipeId == Guid.Empty)
            {
                _logger.LogWarning("Recipe ID cannot be empty for removing favorite.");
                return false;
            }

            _logger.LogInformation("Removing favorite recipe {RecipeId} for user {UserId}", recipeId, userId);

            try
            {
                var result = await _repository.RemoveFavoriteAsync(userId, recipeId);

                if (result)
                {
                    _logger.LogInformation("Successfully removed favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                }
                else
                {
                    _logger.LogWarning("Failed to remove favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing favorite recipe {RecipeId} for user {UserId}", recipeId, userId);
                return await _repository.RemoveFavoriteAsync(userId, recipeId);
            }
        }
    }
}