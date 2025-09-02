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
            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for deleting recipe.");
                return false;
            }

            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for deleting recipe.");
                return false;
            }

            _logger.LogInformation("Deleting recipe {RecipeId} for user {UserId}", recipeId, userId);

            try
            {
                // Check ownership
                var isOwner = await _repository.IsRecipeOwnerAsync(recipeId, userId);
                if (!isOwner)
                {
                    _logger.LogWarning("User {UserId} is not owner of recipe {RecipeId}", userId, recipeId);
                    return false;
                }

                var result = await _repository.DeleteRecipeAsync(recipeId);

                if (!result)
                {
                    _logger.LogWarning("Failed to delete recipe {RecipeId} for user {UserId}", recipeId, userId);
                    return false;
                }

                _logger.LogInformation("Successfully deleted recipe {RecipeId} for user {UserId}", recipeId, userId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting redcipe {RecipeId} for user {UserId}", recipeId, userId);
                return false;
            }  
        }

        public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for retrieval.");
                return null;
            }

            _logger.LogInformation("Retrieving recipe {RecipeId}", id);

            try
            {
                var result = await _repository.GetRecipeByIdAsync(id);

                if (result == null)
                {
                    _logger.LogWarning("Recipe {RecipeId} not found", id);
                    return null;
                }

                _logger.LogInformation("Successfully retrieved recipe {RecipeId}", id);

                return result;
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Error retrieving recipe {RecipeId}", id);
                return null;
            }  
        }

        public async Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for retrieving user recipes.");
                return [];
            }

            _logger.LogInformation("Retrieving recipes for user {UserId}", userId);

            try
            {
                var result = await _repository.GetUserRecipesAsync(userId);

                _logger.LogInformation("Successfully retrieved {Count} recipes for user {UserId}", result.Count(), userId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recipes for user {UserId}", userId);
                return [];
            }
            
        }

        public async Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId)
        {
            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for ownership check.");
            }

            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for ownership check.");
            }

            try
            {
                return await _repository.IsRecipeOwnerAsync(recipeId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking recipe ownership for recipe {RecipeId} and user {UserId}", recipeId, userId);
                return false;
            } 
        }

        public async Task<Recipe?> UpdateUserRecipeAsync(Guid recipeId, Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null)
        {
            if (recipeId == Guid.Empty)
            {
                _logger.LogError("Recipe ID cannot be empty for updating recipe.");
                return null;
            }

            if (userId == Guid.Empty)
            {
                _logger.LogError("User ID cannot be empty for updating recipe.");
                return null;
            }

            if (string.IsNullOrWhiteSpace(title))
            {
                _logger.LogWarning("Recipe title cannot be empty for updating recipe.");
                return null;
            }

            if (ingredients == null || ingredients.Count == 0)
            {
                _logger.LogWarning("Recipe ingredients cannot be empty for updating recipe.");
                return null;
            }

            if (string.IsNullOrWhiteSpace(instructions))
            {
                _logger.LogWarning("Recipe instructions cannot be empty for updating recipe.");
                return null;
            }

            _logger.LogInformation("Updating recipe {RecipeId} for user {UserId}", recipeId, userId);

            try
            {
                // Check ownership
                var isOwner = await _repository.IsRecipeOwnerAsync(recipeId, userId);
                if (!isOwner)
                {
                    _logger.LogWarning("User {UserId} is not owner of recipe {RecipeId}", userId, recipeId);
                    return null;
                }

                var existingRecipe = await _repository.GetRecipeByIdAsync(recipeId);
                if (existingRecipe == null)
                {
                    _logger.LogWarning("Recipe {RecipeId} not found for update", recipeId);
                    return null;
                }

                // Update recipe
                existingRecipe.Title = title;
                existingRecipe.Ingredients = ingredients;
                existingRecipe.Instructions = instructions;
                existingRecipe.ImageUrl = imageUrl;

                var result = await _repository.UpdateRecipeAsync(existingRecipe);

                if (result == null)
                {
                    _logger.LogWarning("Failed to update recipe {RecipeId} for user {UserId}", recipeId, userId);
                    return null;
                }

                _logger.LogInformation("Successfully updated recipe {RecipeId} for user {UserId}", recipeId, userId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating recipe {RecipeId} for user {UserId}", recipeId, userId);
                return null;
            }
           
        }
    }
}
