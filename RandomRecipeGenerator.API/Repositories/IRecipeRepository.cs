using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public interface IRecipeRepository
    {
        Task<Recipe?> CreateRecipeAsync(Recipe recipe);
        Task<Recipe?> GetRecipeByIdAsync(Guid id);
        Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId);
        Task<Recipe?> UpdateRecipeAsync(Recipe recipe);
        Task<bool> DeleteRecipeAsync(Guid id);
        Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId);
    }
}
