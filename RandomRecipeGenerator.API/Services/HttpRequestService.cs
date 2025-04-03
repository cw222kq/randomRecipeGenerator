using System.Net.Http;
using System.Reflection.PortableExecutable;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Http.Json;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.Exceptions;

namespace RandomRecipeGenerator.API.Services
{
    public class HttpRequestService(HttpClient httpClient, IConfiguration configuration)
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly IConfiguration _configuration = configuration;

        public async Task<Recipe> Get(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                Console.WriteLine("Empty URL provided to Get method");
                throw new RecipeAPIException("We couldn't process your request. Please make sure you're using the correct recipe search parameters.");
            }

            if (string.IsNullOrEmpty(_configuration["SpoonacularApiKey"]))
            {
                Console.WriteLine("Spoonacular API key is not configured in appsettings.json");
                throw new RecipeAPIException("Service is temporarily unavailable. Please try again later.");
            }

            var urlWithApiKey = url + "&apiKey=" + _configuration["SpoonacularApiKey"];
            
            try
            {
                var response = await _httpClient.GetAsync(urlWithApiKey);
                response.EnsureSuccessStatusCode();
                var jsonString = await response.Content.ReadAsStringAsync();

                try 
                {
                    var data = JsonSerializer.Deserialize<JsonDocument>(jsonString);
                    var recipe = data == null ? throw new RecipeParsingException("Unable to find a recipe. Please try again later.")
                         : data.RootElement.GetProperty("recipes")[0];

                    return MapJSONToRecipe(recipe);
                }
                catch (JsonException e)
                {
                    Console.WriteLine($"JSON parsing error, failed to parse recipe data: {e.Message}");
                    throw new RecipeParsingException("Unable to process the recipe data. Please try again later.");
                }
                
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"HTTP request error, Failed to fetch recipe from Spoonacular: {e.Message}. Provided URL: {url}");
                throw new RecipeAPIException("Service is temporarily unavailable. Please try again later.");
            }
            catch (Exception e)
            {
                Console.WriteLine($"An unexpected error occurred: {e.Message}. Provided URL: {url}");
                throw new Exception("An unexpected error occurred. Please try again later.");
            }
        }

        private static Recipe MapJSONToRecipe(JsonElement recipe)
        {
            var ingredients = new List<string>();
            foreach (var ingredient in recipe.GetProperty("extendedIngredients").EnumerateArray())
            {
                Console.WriteLine(ingredient.GetProperty("name").GetString());
                ingredients.Add(ingredient.GetProperty("name").GetString() ?? string.Empty);
            }

            return new Recipe
            {
                Id = Guid.NewGuid(),
                SpoonacularId = recipe.GetProperty("id").GetInt32(),
                Title = recipe.GetProperty("title").GetString() ?? string.Empty,
                Ingredients = ingredients,
                Instructions = recipe.GetProperty("instructions").GetString() ?? string.Empty,
                ImageUrl = recipe.GetProperty("image").GetString()
            };
        }
    }
}




