using Microsoft.AspNetCore.Http;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using RandomRecipeGenerator.API.Services;
using System.Text.Json;
using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeController(HttpRequestService httpRequestService, IMapper mapper) : ControllerBase
    {
        private readonly HttpRequestService _httpRequestService = httpRequestService;
        private readonly IMapper _mapper = mapper;

        // GET: api/recipe
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var recipeDomain = await _httpRequestService.Get("https://api.spoonacular.com/recipes/random?number=1&includeNutrition=false");

            Console.WriteLine("recipeDomain in RecipeController:");
            Console.WriteLine(JsonSerializer.Serialize(recipeDomain));
            
            return Ok(_mapper.Map<RecipeDTO>(recipeDomain));
        }
    }
}
