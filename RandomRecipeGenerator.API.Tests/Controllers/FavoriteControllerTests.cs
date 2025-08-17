using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Controllers
{
    public class FavoriteControllerTests
    {
        private readonly Mock<IUserFavoriteService> _serviceMock;
        private readonly Mock<ILogger<FavoriteController>> _loggerMock;
        private readonly FavoriteControllerTests _controller;

        public FavoriteControllerTests()
        {
            _serviceMock = new Mock<IUserFavoriteService>();
            _loggerMock = new Mock<ILogger<FavoriteController>>();
            _controller = new FavoriteController(_serviceMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task AddFavorite_ValidIntput_ReturnsOk()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();
            var expectedFavorite = new UserFavoriteRecipe { UserId = userId, RecipeId = recipeId };

            _serviceMock
                .Setup(s => s.AddFavoriteAsync(userId, recipeId))
                .ReturnsAsync(expectedFavorite);

            // Act
            var result = await _controller.AddFavorite(userId, recipeId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedFavorite, OkResult.Value);
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
        public async Task RemoveFavorite_ValidInput_ReturnsOk()
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
            Assert.IsType<OkObjectResult>(result);
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
