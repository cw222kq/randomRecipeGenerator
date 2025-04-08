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
    public class RecipeController(IHttpRequestService httpRequestService, IMapper mapper, ILogger<RecipeController> logger) : ControllerBase
    {
        private readonly IHttpRequestService _httpRequestService = httpRequestService;
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
    }
}
