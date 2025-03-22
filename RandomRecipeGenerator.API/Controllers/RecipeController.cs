using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeController(HttpRequestService httpRequestService) : ControllerBase
    {
        private readonly HttpRequestService _httpRequestService = httpRequestService;

        // GET: api/recipe
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _httpRequestService.GetAsync("https://api.spoonacular.com/recipes/random?number=1&includeNutrition=false");

            return Ok(result);
        }
    }
}
