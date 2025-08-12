using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public interface IUserFavoriteRepository
    {
        Task<UserFavoriteRecipe?> AddFavoriteAsync(Guid userId, Guid recipeId);
        Task<bool> RemoveFavoriteAsync(Guid userId, Guid recipeId);
        Task<bool> IsFavoriteAsync(Guid userId, Guid recipeId);
        Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid userId);
    }
}
