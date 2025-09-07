using Microsoft.AspNetCore.Http;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using RandomRecipeGenerator.API.Services;
using System.Text.Json;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Models.Exceptions;

namespace RandomRecipeGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeController(IHttpRequestService httpRequestService, IRecipeService recipeService, IMapper mapper, ILogger<RecipeController> logger) : ControllerBase
    {
        private readonly IHttpRequestService _httpRequestService = httpRequestService;
        private readonly IRecipeService _recipeService = recipeService;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<RecipeController> _logger = logger;

        // GET: api/recipe
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try {
                _logger.LogInformation("Processing recipe request");
                var recipeDomain = await _httpRequestService.Get("https://api.spoonacular.com/recipes/random?number=1&includeNutrition=false");
                _logger.LogInformation("Recipe received: {@Recipe}", recipeDomain);
                var recipeDTO = _mapper.Map<RecipeDTO>(recipeDomain);
                _logger.LogInformation("Successfully processed recipe request. Recipe ID: {RecipeId}", recipeDTO.Id);
                return Ok(recipeDTO);
            }
            catch (RecipeParsingException ex)
            {
                _logger.LogError(ex, "Failed to parse recipe data");
                return StatusCode(500, new ErrorResponseDTO
                { 
                    Message = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (RecipeAPIException ex)
            {
                _logger.LogError(ex, "Failed to fetch recipe from Spoonacular API");
                return StatusCode(500, new ErrorResponseDTO
                {
                    Message = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        // POST: api/recipe/{userId}
        [HttpPost("{userId}")]
        public async Task<IActionResult> CreateUserRecipe(Guid userId, [FromBody] RecipeRequestDTO request)
        {
            var result = await _recipeService.CreateUserRecipeAsync(
                userId,
                request.Title,
                request.Ingredients,
                request.Instructions,
                request.ImageUrl
            );

            if (result == null)
            {
                return BadRequest("Failed to create recipe.");
            }

            var recipeDTO = _mapper.Map<RecipeDTO>(result);
            return Ok(recipeDTO);
        }

        // GET: api/recipe/user/{id}
        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUserRecipe(Guid id)
        {
            var result = await _recipeService.GetRecipeByIdAsync(id);

            if (result == null)
            {
                return NotFound();
            }

            var recipeDTO = _mapper.Map<RecipeDTO>(result);

            return Ok(recipeDTO);
        }

        // GET: api/recipe/user/{userId}/all
        [HttpGet("user/{userId}/all")]
        public async Task<IActionResult> GetUserRecipes(Guid userId)
        {
            var result = await _recipeService.GetUserRecipesAsync(userId);

            var recipeDTOs = _mapper.Map<IEnumerable<RecipeDTO>>(result);

            return Ok(recipeDTOs);
        }

        // PUT: api/recipe/{id}/user/{userId}
        [HttpPut("{id}/user/{userId}")]
        public async Task<IActionResult> UpdateUserRecipe(Guid id, Guid userId, [FromBody] RecipeRequestDTO request)
        {
            var result = await _recipeService.UpdateUserRecipeAsync(
                id,
                userId,
                request.Title,
                request.Ingredients,
                request.Instructions,
                request.ImageUrl
            );

            if (result == null)
            {
                return NotFound("Recipe not found or you don't have permission to update it.");
            }

            var recipeDTO = _mapper.Map<RecipeDTO>(result);

            return Ok(recipeDTO);
        }

        // DELETE: api/recipe/{id}/user/{userId}
        public async Task<IActionResult> DeleteUserRecipe(Guid id, Guid userId)
        { 
            throw new NotImplementedException();
        }
    }
}
