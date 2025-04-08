using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using RandomRecipeGenerator.API.Models.Exceptions;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Services
{
    public class HttpRequestServiceTests
    {
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly Mock<ILogger<HttpRequestService>> _loggerMock;
        private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
        private readonly HttpClient _httpClient;
        private readonly IHttpRequestService _httpRequestService;

        public HttpRequestServiceTests()
        {
            _configurationMock = new Mock<IConfiguration>();
            _loggerMock = new Mock<ILogger<HttpRequestService>>();
            _httpMessageHandlerMock = new Mock<HttpMessageHandler>();

            _configurationMock.Setup(c => c["SpoonacularApiKey"]).Returns("test-api-key");

            _httpClient = new HttpClient(_httpMessageHandlerMock.Object);

            _httpRequestService = new HttpRequestService(
                _httpClient, 
                _configurationMock.Object, 
                _loggerMock.Object);
        }

        [Fact]
        public async Task Get_WhenUrlIsEmpty_ThrowsRecipeAPIException()
        {
            // Arrange
            var url = string.Empty;

            // Act & Assert
            var exception = await Assert.ThrowsAsync<RecipeAPIException>(() => _httpRequestService.Get(url));
            Assert.Equal("We couldn't process your request. Please make sure you're using the correct recipe search parameters.", exception.Message);
        }

        [Fact]
        public async Task Get_WhenAPIKeyIsMissing_ThrowsRecipeAPIException()
        {
            // Arrange
            var url = "https://api.spoonacular.com/recipes/random";
            _configurationMock.Setup(c => c["SpoonacularApiKey"]).Returns(null as string);
            
            // Act & Assert
            var exception = await Assert.ThrowsAsync<RecipeAPIException>(() => _httpRequestService.Get(url));
            Assert.Equal("Service is temporarily unavailable. Please try again later.", exception.Message);
        }

        [Fact]
        public async Task Get_WhenHttpCallFails_ThrowsRecipeAPIException()
        { 
            // Arrange
            var url = "https://api.spoonacular.com/recipes/random";
            var httpResponseInternalServerError = new HttpResponseMessage(System.Net.HttpStatusCode.InternalServerError);

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync", 
                    ItExpr.IsAny<HttpRequestMessage>(), 
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(httpResponseInternalServerError);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<RecipeAPIException>(() => _httpRequestService.Get(url));
            Assert.Equal("Service is temporarily unavailable. Please try again later.", exception.Message);
        }

        [Fact]
        public async Task Get_WhenResponseIsInvalidJson_ThrowsRecipeParsingException()
        { 
            // Arrange
            var url = "https://api.spoonacular.com/recipes/random";
            var invalidJSON = "{ invalid json }";

            var httpResponseSuccess = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent(invalidJSON)
            };

            _httpMessageHandlerMock.
                Protected()
                .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            ).ReturnsAsync(httpResponseSuccess);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<RecipeParsingException>(() => _httpRequestService.Get(url));
            Assert.Equal("Unable to process the recipe data. Please try again later.", exception.Message);
        }

        [Fact]
        public async Task Get_WhenEmptyRecipesArray_ThrowsRecipeParsingException()
        {
            // Arange
            var url = "https://api.spoonacular.com/recipes/random";
            var emptyJSON = @"{ ""recipes"": [] }";

            var httpResponseSuccess = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent(emptyJSON)
            };

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(httpResponseSuccess);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<RecipeParsingException>(() => _httpRequestService.Get(url));
            Assert.Equal("No recipe found or data structure invalid in the API response.", exception.Message);
        }
        
        [Fact]
        public async Task Get_WhenResponseIsValid_ReturnsRecipe()
        {
            // Arrange
            var url = "https://api.spoonacular.com/recipes/random";
            var validJSON = @"{
                ""recipes"": [
                     { 
                        ""id"": 98765, 
                        ""title"": ""Test Recipe"",
                        ""extendedIngredients"": [
                            { ""name"": ""Ingredient X""},
                            { ""name"": ""Ingredient Y""}
                        ],
                        ""instructions"": ""Step 1. Do this. Step2. Do that."",
                        ""image"": ""https://some-url.jpg""
                      }
                 ] 
            }";
            var httpResponseSuccess = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent(validJSON)
            };

            _httpMessageHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(httpResponseSuccess);

            // Act
            var recipeResult = await _httpRequestService.Get(url);

            // Assert
            Assert.NotNull(recipeResult);
            Assert.Equal("Test Recipe", recipeResult.Title);
            Assert.Equal("Step 1. Do this. Step2. Do that.", recipeResult.Instructions);
            Assert.Equal("https://some-url.jpg", recipeResult.ImageUrl);
            Assert.NotNull(recipeResult.Ingredients);
            Assert.Equal(2, recipeResult.Ingredients.Count);
            Assert.Contains("Ingredient X", recipeResult.Ingredients);
            Assert.Contains("Ingredient Y", recipeResult.Ingredients);
            Assert.NotEqual(Guid.Empty, recipeResult.Id);
        }

    }
}
