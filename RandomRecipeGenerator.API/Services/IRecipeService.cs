using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Services
{
    public interface IRecipeService
    {
        Task<Recipe?> CreateUserRecipeAsync(Guid UserId, string title, List<string> ingredients, string instructions, string? imageUrl = null, int? spoonacularId = null);
        Task<Recipe?> GetRecipeByIdAsync(Guid Id);
        Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId);
        Task<Recipe?> UpdateUserRecipeAsync(Guid recipeId, Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null);
        Task<bool> DeleteUserRecipeAsync(Guid recipeId, Guid userId);
        Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId);
    }
}
