using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RandomRecipeGenerator.API.Services;
using System.Text.Json;
using RandomRecipeGenerator.API.Models.DTO;

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
            var recipeDomain = await _httpRequestService.Get("https://api.spoonacular.com/recipes/random?number=1&includeNutrition=false");

            Console.WriteLine("recipeDomain in RecipeController:");
            Console.WriteLine(JsonSerializer.Serialize(recipeDomain));

            var recipeDto = new RecipeDTO
            {
                Id = recipeDomain.Id,
                Title = recipeDomain.Title,
                Ingredients = recipeDomain.Ingredients,
                Instructions = recipeDomain.Instructions,
                ImageUrl = recipeDomain.ImageUrl
            };

            return Ok(recipeDto);
        }
    }
}
