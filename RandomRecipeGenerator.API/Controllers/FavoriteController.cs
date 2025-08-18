using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteController(IUserFavoriteService userFavoriteService, ILogger<FavoriteController> logger) : ControllerBase
    {
        private readonly IUserFavoriteService _userFavoriteService = userFavoriteService;
        private readonly ILogger<FavoriteController> _logger = logger;

        [HttpPost("{userId}/{recipeId}")]
        public async Task<IActionResult> AddFavorite(Guid userId, Guid recipeId)
        {
            try
            {
                _logger.LogInformation("Adding favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);

                var result = await _userFavoriteService.AddFavoriteAsync(userId, recipeId);

                if (result == null)
                {
                    _logger.LogWarning("Failed to add favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);
                    return BadRequest("Failed to add favorite.");
                }

                _logger.LogInformation("Successfully added favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while adding the favorite.");
            }
        }

        [HttpDelete("{userId}/{recipeId}")]
        public async  Task<IActionResult> RemoveFavorite(Guid userId, Guid recipeId)
        {
            try
            {
                _logger.LogInformation("Removing favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);

                var result = await _userFavoriteService.RemoveFavoriteAsync(userId, recipeId);

                if (!result)
                {
                    _logger.LogWarning("Failed to remove favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);
                    return NotFound("Favorite not found or could not be removed.");
                }

                _logger.LogInformation("Successfully removed favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing favorite for user {UserId} and recipe {RecipeId}", userId, recipeId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while removing the favorite.");
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserFavorites(Guid userId)
        {
            try
            {
                _logger.LogInformation("Retrieving favorites for user {UserId}", userId);

                var result = await _userFavoriteService.GetUserFavoritesAsync(userId);

                _logger.LogInformation("Successfully retrieved {Count} favorites for user {UserId}", result.Count(), userId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving favorites for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving favorites.");
            }
        }
    }
}
