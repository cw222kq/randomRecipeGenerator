using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Controllers;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Controllers
{
    public class FavoriteControllerTests
    {
        private readonly Mock<IUserFavoriteService> _serviceMock;
        private readonly Mock<IRecipeService> _recipeServiceMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<FavoriteController>> _loggerMock;
        private readonly FavoriteController _controller;

        public FavoriteControllerTests()
        {
            _serviceMock = new Mock<IUserFavoriteService>();
            _recipeServiceMock = new Mock<IRecipeService>();
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<FavoriteController>>();
            _controller = new FavoriteController(_serviceMock.Object, _recipeServiceMock.Object, _loggerMock.Object, _mapperMock.Object);
        }

        [Fact]
        public async Task AddFavorite_ValidInput_ReturnsCreated()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();
            var expectedFavorite = new UserFavoriteRecipe { UserId = userId, RecipeId = recipeId };
            var expectedRecipe = new Recipe
            {
                Id = recipeId,
                Title = "Test Recipe",
                SpoonacularId = 12345,
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients"
            };
            var expectedRecipeDTO = new RecipeDTO
            {
                Id = recipeId,
                Title = "Test Recipe",
                SpoonacularId = 12345,
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients"
            };

            _serviceMock
                .Setup(s => s.AddFavoriteAsync(userId, recipeId))
                .ReturnsAsync(expectedFavorite);

            _recipeServiceMock
                .Setup(s => s.GetRecipeByIdAsync(recipeId))
                .ReturnsAsync(expectedRecipe);

            _mapperMock
                .Setup(m => m.Map<RecipeDTO>(expectedRecipe))
                .Returns(expectedRecipeDTO);

            // Act
            var result = await _controller.AddFavorite(userId, recipeId);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(expectedRecipeDTO, createdResult.Value);
        }

        [Fact]
        public async Task AddFavorite_ServiceReturnsNull_ReturnsBadRequest()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();

            _serviceMock
                .Setup(s => s.AddFavoriteAsync(userId, recipeId))
                .ReturnsAsync((UserFavoriteRecipe?)null);

            // Act
            var result = await _controller.AddFavorite(userId, recipeId);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task RemoveFavorite_ValidInput_ReturnsNoContent()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();

            _serviceMock
                .Setup(s => s.RemoveFavoriteAsync(userId, recipeId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.RemoveFavorite(userId, recipeId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task GetUserFavorites_ValidId_ReturnsOk()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var expectedRecipes = new List<Recipe>
            {
                new() { Id = Guid.NewGuid(), SpoonacularId = 12345, Title = "Test Recipe", Ingredients = ["Salt", "Pepper"], Instructions = "Mix ingredients"},
                new() { Id = Guid.NewGuid(), SpoonacularId = 67890, Title = "Another Test Recipe", Ingredients = ["Sugar", "Flour"], Instructions = "Bake ingredients",}
            };

            _serviceMock
                .Setup(s => s.GetUserFavoritesAsync(userId))
                .ReturnsAsync(expectedRecipes);

            // Act
            var result = await _controller.GetUserFavorites(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedRecipes, okResult.Value);
        }
    }
}
