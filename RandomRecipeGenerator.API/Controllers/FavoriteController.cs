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
            var result = await _userFavoriteService.AddFavoriteAsync(userId, recipeId);

            if (result == null)
            {
                return BadRequest("Failed to add favorite.");
            }

            return Ok(result);
        }

        [HttpDelete("{userId}/{recipeId}")]
        public async  Task<IActionResult> RemoveFavorite(Guid userId, Guid recipeId)
        {
            var result = await _userFavoriteService.RemoveFavoriteAsync(userId, recipeId);

            if (!result)
            {
                return NotFound("Favorite not found or could not be removed.");
            }

            return Ok();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserFavorites(Guid userId)
        {
            throw new NotImplementedException();
        }

    }
}
