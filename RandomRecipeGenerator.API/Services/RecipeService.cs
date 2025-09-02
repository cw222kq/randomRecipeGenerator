using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class RecipeService(IRecipeRepository repository, ILogger<RecipeService> logger) : IRecipeService
    {
        private readonly IRecipeRepository _repository = repository;
        private readonly ILogger<RecipeService> _logger = logger;

        public async Task<Recipe?> CreateUserRecipeAsync(Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null)
        {
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for creating recipe.");
                return null;
            }

            if (string.IsNullOrWhiteSpace(title))
            {
                _logger.LogWarning("Recipe title cannot be empty for creating recipe.");
                return null;
            }

            if (ingredients == null || ingredients.Count == 0)
            {
                _logger.LogWarning("Recipe ingredients cannot be empty for creating recipe.");
                return null;
            }

            if (string.IsNullOrWhiteSpace(instructions))
            {
                _logger.LogWarning("Recipe instructions cannot be empty for creating recipe.");
                return null;
            }

            _logger.LogInformation("Creating user recipe {Title} for user {UserId}", title, userId);

            try
            {
                var recipe = new Recipe
                {
                    Title = title,
                    SpoonacularId = 0,
                    Ingredients = ingredients,
                    Instructions = instructions,
                    ImageUrl = imageUrl,
                    UserId = userId,
                };

                var result = await _repository.CreateRecipeAsync(recipe);

                if (result == null)
                {
                    _logger.LogWarning("Failed to create user recipe {Title} for user {UserId}", title, userId);
                    return null;
                }

                _logger.LogInformation("Sucessfully created user recipe {RecipeId} for user {UserId}", title, userId);

                return result;

            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Error creating user recipe {Title} for user {UserId}", title, userId);
                return null;
            }   
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
