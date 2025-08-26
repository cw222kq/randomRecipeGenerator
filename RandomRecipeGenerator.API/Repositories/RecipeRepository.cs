using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public class RecipeRepository(ApplicationDbContext context, ILogger<RecipeRepository> logger) : IRecipeRepository
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<RecipeRepository> _logger = logger;
        public Task<Recipe?> CreateRecipeAsync(Recipe recipe)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteRecipeAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<Recipe?> GetRecipeByIdAsync(Guid id)
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

        public Task<Recipe?> UpdateRecipeAsync(Recipe recipe)
        {
            throw new NotImplementedException();
        }
    }
}
