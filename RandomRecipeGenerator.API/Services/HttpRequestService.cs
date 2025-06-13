using System.Net.Http;
using System.Reflection.PortableExecutable;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Http.Json;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.Exceptions;
using Microsoft.Extensions.Logging;
using RandomRecipeGenerator.API.Models.DTO;
using System.Net.Http.Headers;

namespace RandomRecipeGenerator.API.Services
{
    public class HttpRequestService(HttpClient httpClient, IConfiguration configuration, ILogger<HttpRequestService> logger) : IHttpRequestService
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly IConfiguration _configuration = configuration;
        private readonly ILogger<HttpRequestService> _logger = logger;

        public async Task<Recipe> Get(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                _logger.LogError("Empty URL provided to Get method");
                throw new RecipeAPIException("We couldn't process your request. Please make sure you're using the correct recipe search parameters.");
            }

            if (string.IsNullOrEmpty(_configuration["SpoonacularApiKey"]))
            {
                _logger.LogError("Spoonacular API key is not configured in appsettings.json");
                throw new RecipeAPIException("Service is temporarily unavailable. Please try again later.");
            }

            _logger.LogDebug("API key validation passed, proceeding with request");
            var urlWithApiKey = url + "&apiKey=" + _configuration["SpoonacularApiKey"];
            
            try
            {
                _logger.LogInformation("Fetching random recipe from Spoonacular API: {Url}", url);
                var response = await _httpClient.GetAsync(urlWithApiKey);
                response.EnsureSuccessStatusCode();
                var jsonString = await response.Content.ReadAsStringAsync();

               
               
                _logger.LogDebug("Deserializing JSON response");
                var data = JsonSerializer.Deserialize<JsonDocument>(jsonString);

                if (data == null)
                {
                    _logger.LogWarning("Deserialized JSON document was null.");
                    throw new RecipeParsingException("Unable to find a recipe. Please try again later.");
                }
               
                var recipe = data.RootElement.GetProperty("recipes")[0];

                _logger.LogInformation("Successfully retrieved and parsed recipe");
                var mappedRecipe = MapJSONToRecipe(recipe);
                _logger.LogInformation("Successfully mapped recipe with ID: {RecipeId}", mappedRecipe.Id);
                
                return mappedRecipe;     
            }
            catch (Exception ex) when (ex is KeyNotFoundException || ex is IndexOutOfRangeException)
            {
                _logger.LogError(ex, "Could not find 'recipes' array or first element in JSON.");
                throw new RecipeParsingException("No recipe found or data structure invalid in the API response.");
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON parsing error, failed to parse recipe data");
                throw new RecipeParsingException("Unable to process the recipe data. Please try again later.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request error, Failed to fetch recipe from Spoonacular. URL: {Url}", url);
                throw new RecipeAPIException("Service is temporarily unavailable. Please try again later.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred. URL: {Url}", url);
                throw new RecipeAPIException("An unexpected error occurred. Please try again later.");
            }
        }

        private static Recipe MapJSONToRecipe(JsonElement recipe)
        {
            var ingredients = new List<string>();
            foreach (var ingredient in recipe.GetProperty("extendedIngredients").EnumerateArray())
            {
                ingredients.Add(ingredient.GetProperty("name").GetString() ?? string.Empty);
            }

            var mappedRecipe = new Recipe
            {
                Id = Guid.NewGuid(),
                SpoonacularId = recipe.GetProperty("id").GetInt32(),
                Title = recipe.GetProperty("title").GetString() ?? string.Empty,
                Ingredients = ingredients,
                Instructions = recipe.GetProperty("instructions").GetString() ?? string.Empty,
                ImageUrl = recipe.GetProperty("image").GetString()
            };

            return mappedRecipe;
        }

        public async Task<GoogleTokenResponseDTO?> PostFormAsync(string url, Dictionary<string, string> formData)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                _logger.LogError("Empty URL provided to PostFormAsync method");
                return null;
            }

            if (formData == null || formData.Count == 0)
            {
                _logger.LogError("Empty or null form data provided to PostFormAsync method");
                return null;
            }

            try
            {
                _logger.LogInformation("Making form POST request to: {Url}", url);
                var content = new FormUrlEncodedContent(formData); // Create form-encoded data from the dictionary to Google's OAuth endpoint
                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OAuth request failed with status code: {StatusCode}", response.StatusCode);
                    return null;
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                _logger.LogDebug("Recived response from OAuth endpoint. Deserializing response");

                var data = JsonSerializer.Deserialize<JsonDocument>(jsonString);
                if (data == null)
                {
                    _logger.LogWarning("Deserialized JSON document was null from OAuth endpoint");
                    return null;
                }

                var googleTokenResponseDTO = new GoogleTokenResponseDTO
                {
                    AccessToken = data.RootElement.GetProperty("access_token").GetString() ?? string.Empty,
                    IdToken = data.RootElement.GetProperty("id_token").GetString() ?? string.Empty,
                    ExpiresIn = data.RootElement.GetProperty("expires_in").GetInt32().ToString() ?? string.Empty
                };

                _logger.LogInformation("Successfully parsed OAuth token response");
                return googleTokenResponseDTO;

            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON parsing error for OAuth response");
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request error while for OAuth request to {Url}", url);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred while making OAuth request to {Url}", url);
                return null;
            }
        }

        public async Task<UserDTO?> GetUserProfileAsync(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogError("Empty access token provided to GetUserProfile method");
                return null;
            }

            const string userInfoUrl = "https://openidconnect.googleapis.com/v1/userinfo";

            try
            {
                _logger.LogInformation("Fething user profile from Google API");

                var request = new HttpRequestMessage(HttpMethod.Get, userInfoUrl);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch user profile from Google API. Status code: {StatusCode}", response.StatusCode);
                    return null;
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                _logger.LogDebug("Received response from Google API. Deserializing response");

                var data = JsonSerializer.Deserialize<JsonDocument>(jsonString);

                if (data == null)
                {
                    _logger.LogWarning("Deserialized user profile JSON was null");
                    return null;
                }

                var userDTO = new UserDTO
                {
                    GoogleUserId = data.RootElement.GetProperty("sub").GetString() ?? string.Empty,
                    Email = data.RootElement.GetProperty("email").GetString() ?? string.Empty,
                    FirstName = data.RootElement.TryGetProperty("given_name", out var givenName) ? givenName.GetString() : null,
                    LastName = data.RootElement.TryGetProperty("family_name", out var familyName) ? givenName.GetString() : null
                };

                _logger.LogInformation("Successfully retrived user profile for: {Email}", userDTO.Email);
                return userDTO;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile from Google API");
                return null;
            }
        }
    }
}




