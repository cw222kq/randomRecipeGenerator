using System.Net.Http;
using System.Reflection.PortableExecutable;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Http.Json;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Services
{
    public class HttpRequestService(HttpClient httpClient, IConfiguration configuration)
    {
        private readonly HttpClient _httpClient = httpClient;

        public async Task<Recipe> Get(string url)
        {
            var urlWithApiKey = url + "&apiKey=" + configuration["SpoonacularApiKey"];
            try
            {
                var response = await _httpClient.GetAsync(urlWithApiKey);
                response.EnsureSuccessStatusCode();
                var jsonString = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<JsonDocument>(jsonString);
                var recipe = data.RootElement.GetProperty("recipes")[0];

                var ingredients = new List<string>();

                foreach (var ingredient in recipe.GetProperty("extendedIngredients").EnumerateArray())
                {
                    Console.WriteLine(ingredient.GetProperty("name").GetString());
                    ingredients.Add(ingredient.GetProperty("name").GetString());
                }

                var recipeDomain = new Recipe
                {
                    Id = Guid.NewGuid(),
                    SpoonacularId = recipe.GetProperty("id").GetInt32(),
                    Title = recipe.GetProperty("title").GetString(),
                    Ingredients = ingredients,
                    Instructions = recipe.GetProperty("instructions").GetString(),
                    ImageUrl = recipe.GetProperty("image").GetString()
                };

                Console.WriteLine("recipeDomain in HttpRequestService:");
                Console.WriteLine(JsonSerializer.Serialize(recipeDomain));
            
                return recipeDomain;
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"An error occurred: {e.Message}");
                throw;
            }
        }

    }
}
