using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class RecipeService(IRecipeRepository repository, ILogger<RecipeService> logger) : IRecipeService
    {
        private readonly IRecipeRepository _repository = repository;
        private readonly ILogger<RecipeService> _logger = logger;

        public async Task<Recipe?> CreateUserRecipeAsync(Guid UserId, string title, List<string> ingredients, string instructions, string? imageUrl = null)
        {
            if (UserId == Guid.Empty || string.IsNullOrWhiteSpace(title) || ingredients == null || ingredients.Count == 0 || string.IsNullOrWhiteSpace(instructions))
            {
                return null;
            }

            var recipe = new Recipe
            {
                Title = title,
                SpoonacularId = 0,
                Ingredients = ingredients,
                Instructions = instructions,
                ImageUrl = imageUrl,
                UserId = UserId,
            };

            return await _repository.CreateRecipeAsync(recipe);
        }

        public async Task<bool> DeleteUserRecipeAsync(Guid recipeId, Guid userId)
        {
            // Check ownership
            var isOwner = await _repository.IsRecipeOwnerAsync(recipeId, userId);
            if (!isOwner)
            {
                return false;
            }

            return await _repository.DeleteRecipeAsync(recipeId);
        }

        public async Task<Recipe?> GetRecipeByIdAsync(Guid Id)
        {
            return await _repository.GetRecipeByIdAsync(Id);
        }

        public async Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId)
        {
            return await _repository.GetUserRecipesAsync(userId);
        }

        public async Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId)
        {
            return await _repository.IsRecipeOwnerAsync(recipeId, userId);
        }

        public async Task<Recipe?> UpdateUserRecipeAsync(Guid recipeId, Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null)
        {
            // Check ownership
            var isOwner = await _repository.IsRecipeOwnerAsync(recipeId, userId);
            if (!isOwner)
            {
                return null;
            }

            var existingRecipe = await _repository.GetRecipeByIdAsync(recipeId);
            if (existingRecipe == null)
            {
                return null;
            }

            // Update recipe
            existingRecipe.Title = title;
            existingRecipe.Ingredients = ingredients;
            existingRecipe.Instructions = instructions;
            existingRecipe.ImageUrl = imageUrl;

            return await _repository.UpdateRecipeAsync(existingRecipe);
        }
    }
}
