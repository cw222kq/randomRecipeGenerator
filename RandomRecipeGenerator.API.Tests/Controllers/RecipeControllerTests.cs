using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Controllers;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Services;
using RandomRecipeGenerator.API.Models.Exceptions;
using Xunit;

namespace RandomRecipeGenerator.API.Tests.Controllers
{
    public class RecipeControllerTests
    {
        private readonly Mock<IHttpRequestService> _httpRequestServiceMock;
        private readonly Mock<IRecipeService> _recipeServiceMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<RecipeController>> _loggerMock;

        private readonly RecipeController _controller;

        public RecipeControllerTests()
        {
            _httpRequestServiceMock = new Mock<IHttpRequestService>();
            _recipeServiceMock = new Mock<IRecipeService>();
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<RecipeController>>();

            _controller = new RecipeController(
                _httpRequestServiceMock.Object,
                _recipeServiceMock.Object,
                _mapperMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task Get_WhenServiceSucceds_ReturnOkWithRecipeDTO()
        {
            //Arrange
            var fakeDomainRecipe = new Recipe
            {
                Id = Guid.NewGuid(),
                SpoonacularId = 1,
                Title = "Test Recipe",
                Ingredients = [ "Ingredient X", "Ingredient Y" ],
                Instructions = "Mix all the ingredients together.",
                ImageUrl = "https://example.com/image.jpg"
            };

            var fakeRecipeDTO = new RecipeDTO
            {
                Id = fakeDomainRecipe.Id,
                SpoonacularId = fakeDomainRecipe.SpoonacularId,
                Title = fakeDomainRecipe.Title,
                Ingredients = fakeDomainRecipe.Ingredients,
                Instructions = fakeDomainRecipe.Instructions,
                ImageUrl = fakeDomainRecipe.ImageUrl
            };

            _httpRequestServiceMock
                .Setup(service => service.Get(It.IsAny<string>()))
                .ReturnsAsync(fakeDomainRecipe);

            _mapperMock
                .Setup(mapper => mapper.Map<RecipeDTO>(fakeDomainRecipe))
                .Returns(fakeRecipeDTO);

            // Act
            var actionResult = await _controller.Get();

            // Asssert
            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            var returnedDTO = Assert.IsType<RecipeDTO>(okResult.Value);
            Assert.Equal(fakeRecipeDTO.Id, returnedDTO.Id);
            Assert.Equal(fakeRecipeDTO.Title, returnedDTO.Title);
            Assert.Equal(fakeRecipeDTO.Ingredients, returnedDTO.Ingredients);
            Assert.Equal(fakeRecipeDTO.Instructions, returnedDTO.Instructions);
            Assert.Equal(fakeRecipeDTO.ImageUrl, returnedDTO.ImageUrl);
        }

        [Fact]
        public async Task Get_WhenServiceThrowsRecipeParsingException_ReturnsInternalServerError()
        {
            var fakeRecipeParsingException = new RecipeParsingException("fake parsing error message");

            _httpRequestServiceMock
                .Setup(service => service.Get(It.IsAny<string>()))
                .ThrowsAsync(fakeRecipeParsingException);

            // Act
            var actionResult = await _controller.Get();

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(actionResult);

            Assert.Equal(500, objectResult.StatusCode);
            var errorResponse = Assert.IsType<ErrorResponseDTO>(objectResult.Value);
            Assert.Equal(fakeRecipeParsingException.Message, errorResponse.Message);
        }

        [Fact]
        public async Task Get_WhenServiceThrowsRecipeAPIException_ReturnsInternalServerError()
        {
            var fakeRecipeAPIException = new RecipeAPIException("fake API error message");

            _httpRequestServiceMock
                .Setup(service => service.Get(It.IsAny<string>()))
                .ThrowsAsync(fakeRecipeAPIException);

            // Act
            var actionResult = await _controller.Get();

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(actionResult);

            Assert.Equal(500, objectResult.StatusCode);
            var errorResponse = Assert.IsType<ErrorResponseDTO>(objectResult.Value);
            Assert.Equal(fakeRecipeAPIException.Message, errorResponse.Message);    
        }

        [Fact]
        public async Task CreateUserRecipe_ValidInput_ReturnsCreated()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeRequest = new RecipeRequestDTO
            {
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/image.jpg"
            };

            var createdRecipe = new Recipe
            {
                Id = Guid.NewGuid(),
                Title = recipeRequest.Title,
                SpoonacularId = null,
                Ingredients = recipeRequest.Ingredients,
                Instructions = recipeRequest.Instructions,
                ImageUrl = recipeRequest.ImageUrl,
                UserId = userId
            };

            var recipeDTO = _mapperMock.Object.Map<RecipeDTO>(createdRecipe);

            _recipeServiceMock
                .Setup(s => s.CreateUserRecipeAsync(userId, recipeRequest.Title, recipeRequest.Ingredients, recipeRequest.Instructions, recipeRequest.ImageUrl, null))
                .ReturnsAsync(createdRecipe);

            _mapperMock
                .Setup(m => m.Map<RecipeDTO>(createdRecipe))
                .Returns(recipeDTO);

            // Act
            var result = await _controller.CreateUserRecipe(userId, recipeRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(RecipeController.GetUserRecipe), createdResult.ActionName);
            Assert.Equal(createdRecipe.Id, createdResult.RouteValues!["id"]);
            Assert.Equal(recipeDTO, createdResult.Value);
        }

        [Fact]
        public async Task CreateUserRecipe_ServiceReturnsNull_ReturnsBadRequest()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeRequest = new RecipeRequestDTO
            {
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/image.jpg"
            };

            _recipeServiceMock
                .Setup(s => s.CreateUserRecipeAsync(userId, recipeRequest.Title, recipeRequest.Ingredients, recipeRequest.Instructions, recipeRequest.ImageUrl, null))
                .ReturnsAsync((Recipe?)null);

            // Act
            var result = await _controller.CreateUserRecipe(userId, recipeRequest);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task GetUserRecipe_ValidId_ReturnsOk()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var recipe = new Recipe
            {
                Id = recipeId,
                Title = "Test Recipe",
                SpoonacularId = null,
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/image.jpg"
            };

            var recipeDTO = _mapperMock.Object.Map<RecipeDTO>(recipe);

            _recipeServiceMock
                .Setup(s => s.GetRecipeByIdAsync(recipeId))
                .ReturnsAsync(recipe);

            _mapperMock
                .Setup(m => m.Map<RecipeDTO>(recipe))
                .Returns(recipeDTO);

            // Act
            var result = await _controller.GetUserRecipe(recipeId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(recipeDTO, okResult.Value);
        }

        [Fact]
        public async Task GetUserRecipe_RecipeNotFound_ReturnsNotFound()
        {
            // Arrange
            var recipeId = Guid.NewGuid();

            _recipeServiceMock
                .Setup(s => s.GetRecipeByIdAsync(recipeId))
                .ReturnsAsync((Recipe?)null);

            // Act
            var result = await _controller.GetUserRecipe(recipeId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetUserRecipes_ValidUserId_ReturnsOk()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipes = new List<Recipe>
            {
                new() { Id = Guid.NewGuid(), SpoonacularId = null, Title = "Test Recipe", Ingredients = ["Salt", "Pepper" ], Instructions = "Mix ingredients"},
                new() { Id = Guid.NewGuid(), SpoonacularId = null, Title = "Another Test Recipe", Ingredients = ["Sugar", "Flour"], Instructions = "Bake ingredients"}
            };

            var recipeDTOs = _mapperMock.Object.Map<IEnumerable<RecipeDTO>>(recipes);

            _recipeServiceMock
                .Setup(s => s.GetUserRecipesAsync(userId))
                .ReturnsAsync(recipes);

            _mapperMock
                .Setup(m => m.Map<IEnumerable<RecipeDTO>>(recipes))
                .Returns(recipeDTOs);

            // Act
            var result = await _controller.GetUserRecipes(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(recipeDTOs, okResult.Value);
        }

        [Fact]
        public async Task UpdateUserRecipe_ValidInput_ReturnsOk()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var updateRequest = new RecipeRequestDTO
            {
                Title = "Updated Recipe",
                Ingredients = ["UpdatedIngredient"],
                Instructions = "Updated instructions",
                ImageUrl = "https://updated.com/image.jpg"
            };
            
            var updatedRecipe = new Recipe
            {
                Id = recipeId,
                Title = "Test Recipe",
                SpoonacularId = null,
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/image.jpg",
                UserId = userId
            };

            var recipeDTO = _mapperMock.Object.Map<RecipeDTO>(updatedRecipe);

            _recipeServiceMock
                .Setup(s => s.UpdateUserRecipeAsync(recipeId, userId, updateRequest.Title, updateRequest.Ingredients, updateRequest.Instructions, updateRequest.ImageUrl))
                .ReturnsAsync(updatedRecipe);

            _mapperMock
                .Setup(m => m.Map<RecipeDTO>(updatedRecipe))
                .Returns(recipeDTO);

            // Act
            var result = await _controller.UpdateUserRecipe(recipeId, userId, updateRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(recipeDTO, okResult.Value);
        }

        [Fact]
        public async Task UpdateUserRecipe_ServiceReturnsNull_ReturnsNotFound()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var updateRequest = new RecipeRequestDTO
            {
                Title = "Updated Recipe",
                Ingredients = ["UpdatedIngredient"],
                Instructions = "Updated instructions",
                ImageUrl = "https://updated.com/image.jpg"
            };

            _recipeServiceMock
                .Setup(s => s.UpdateUserRecipeAsync(recipeId, userId, updateRequest.Title, updateRequest.Ingredients, updateRequest.Instructions, updateRequest.ImageUrl))
                .ReturnsAsync((Recipe?)null);

            // Act
            var result = await _controller.UpdateUserRecipe(recipeId, userId, updateRequest);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteUserRecipe_ValidInput_ReturnsNoContent()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            _recipeServiceMock
                .Setup(s => s.DeleteUserRecipeAsync(recipeId, userId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteUserRecipe(recipeId, userId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteUserRecipe_ServiceReturnsFalse_ReturnsNotFound()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            _recipeServiceMock
                .Setup(s => s.DeleteUserRecipeAsync(recipeId, userId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteUserRecipe(recipeId, userId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
