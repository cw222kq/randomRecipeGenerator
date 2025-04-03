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
    public class RecipeController(HttpRequestService httpRequestService, IMapper mapper) : ControllerBase
    {
        private readonly HttpRequestService _httpRequestService = httpRequestService;
        private readonly IMapper _mapper = mapper;

        // GET: api/recipe
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try {
                 var recipeDomain = await _httpRequestService.Get("https://api.spoonacular.com/recipes/random?number=1&includeNutrition=false");

                Console.WriteLine("recipeDomain in RecipeController:");
                Console.WriteLine(JsonSerializer.Serialize(recipeDomain));
            
                return Ok(_mapper.Map<RecipeDTO>(recipeDomain));
            }
            catch (RecipeParsingException e)
            {
                return StatusCode(500, new ErrorResponseDTO
                { 
                    Message = e.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (RecipeAPIException e)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Message = e.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception e)
            {
                return StatusCode(500, new ErrorResponseDTO
                {
                    Message = e.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
