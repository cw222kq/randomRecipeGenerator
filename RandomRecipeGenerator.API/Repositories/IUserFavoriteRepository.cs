using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public interface IUserFavoriteRepository
    {
        Task<UserFavoriteRecipe?> AddFavoriteAsync(Guid UserId, Guid RecipeId);
        Task<bool> RemoveFavoriteAsync(Guid UserId, Guid recipeId);
        Task<bool> IsFavoriteAsync(Guid UserId, Guid RecipeId);
        Task<IEnumerable<Recipe>> GetUserFavoritesAsync(Guid UserId);
    }
}
