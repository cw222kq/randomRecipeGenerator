using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class RecipeService(IRecipeRepository repository, ILogger<RecipeService> logger) : IRecipeService
    {
        private readonly IRecipeRepository _repository = repository;
        private readonly ILogger<RecipeService> _logger = logger;

        public Task<Recipe?> CreateUserRecipeAsync(Guid UserId, string title, List<string> ingredients, string instructions, string? imageUrl = null)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteUserRecipeAsync(Guid recipeId, Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<Recipe?> GetRecipeByIdAsync(Guid Id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<Recipe?> UpdateUserRecipeAsync(Guid recipeId, Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null)
        {
            throw new NotImplementedException();
        }
    }
}
