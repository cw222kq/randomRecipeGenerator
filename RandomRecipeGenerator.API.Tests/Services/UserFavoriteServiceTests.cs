using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Services
{
    public class UserFavoriteServiceTests
    {
        private readonly Mock<IUserFavoriteRepository> _repositoryMock;
        private readonly Mock<ILogger<UserFavoriteService>> _loggerMock;
        private readonly UserFavoriteService _service;

        public UserFavoriteServiceTests()
        {
            _repositoryMock = new Mock<IUserFavoriteRepository>();
            _loggerMock = new Mock<ILogger<UserFavoriteService>>();
            _service = new UserFavoriteService(_repositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Add_FavoriteAsync_ValidInput_CallsRepository()
        {
            // Act
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();
            var expectedFavorite = new UserFavoriteRecipe
            {
                UserId = userId,
                RecipeId = recipeId,
                CreatedAt = DateTime.UtcNow
            };

            _repositoryMock
                .Setup(repo => repo.AddFavoriteAsync(userId, recipeId))
                .ReturnsAsync(expectedFavorite);

            // Act
            var result = await _service.AddFavoriteAsync(userId, recipeId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedFavorite.UserId, result.UserId);
            _repositoryMock
                .Verify(r => r.AddFavoriteAsync(userId, recipeId), Times.Once);
        }

        [Fact]
        public async Task AddFavoriteAsync_EmptyUserId_ReturnsNull()
        {
            // Arrange
            var userId = Guid.Empty;
            var recipeId = Guid.NewGuid();

            // Act
            var result = await _service.AddFavoriteAsync(userId, recipeId);

            // Assert
            Assert.Null(result);
            _repositoryMock
                .Verify(r => r.AddFavoriteAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task AddFavoriteAsync_EmptyRecipeId_ReturnsNull()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.Empty;

            // Act
            var result = await _service.AddFavoriteAsync(userId, recipeId);

            // Assert
            Assert.Null(result);
            _repositoryMock
                .Verify(r => r.AddFavoriteAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task RemoveFavoriteAsync_ValidInput_CallsRepository()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();

            _repositoryMock
                .Setup(r => r.RemoveFavoriteAsync(userId, recipeId))
                .ReturnsAsync(true);

            // Act
            var result = await _service.RemoveFavoriteAsync(userId, recipeId);

            // Assert
            Assert.True(result);
            _repositoryMock
                .Verify(r => r.RemoveFavoriteAsync(userId, recipeId), Times.Once);
        }

        [Fact]
        public async Task RemoveFavoriteAsync_EmptyUserId_ReturnsFalse()
        {
            // Arrange
            var userId = Guid.Empty;
            var recipeId = Guid.NewGuid();

            // Act
            var result = await _service.RemoveFavoriteAsync(userId, recipeId);

            // Assert
            Assert.False(result);
            _repositoryMock
                .Verify(r => r.RemoveFavoriteAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task RemoveFavoriteAsync_EmptyRecipeId_ReturnsFalse()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.Empty;

            // Act
            var result = await _service.RemoveFavoriteAsync(userId, recipeId);

            // Assert
            Assert.False(result);
            _repositoryMock
                .Verify(r => r.RemoveFavoriteAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task IsFavoriteAsync_ValidInput_CallsRepository()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.NewGuid();

            _repositoryMock
                .Setup(r => r.IsFavoriteAsync(userId, recipeId))
                .ReturnsAsync(true);

            // Act
            var result = await _service.IsFavoriteAsync(userId, recipeId);

            // Assert
            Assert.True(result);
            _repositoryMock
                .Verify(r => r.IsFavoriteAsync(userId, recipeId), Times.Once);
        }

        [Fact]
        public async Task IsFavoriteAsync_EmptyUserId_ReturnsFalse()
        {
            // Arrange
            var userId = Guid.Empty;
            var recipeId = Guid.NewGuid();

            // Act
            var result = await _service.IsFavoriteAsync(userId, recipeId);

            // Assert
            Assert.False(result);
            _repositoryMock
                .Verify(r => r.IsFavoriteAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task IsFavoriteAsync_EmptyRecipeId_ReturnsFalse()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeId = Guid.Empty;

            // Act
            var result = await _service.IsFavoriteAsync(userId, recipeId);

            // Assert
            Assert.False(result);
            _repositoryMock
                .Verify(r => r.IsFavoriteAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task GetUserFavoritesAsync_ValidUserId_CallsRepository()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var expectedRecipes = new List<Recipe>
            {
                new() { Id = Guid.NewGuid(), SpoonacularId = 123, Title = "Test Recipe", Ingredients = ["Salt", "Pepper" ], Instructions = "Mix ingredients"},
                new() { Id = Guid.NewGuid(), SpoonacularId = 345, Title = "Another Test Recipe", Ingredients = ["Sugar", "Flour"], Instructions = "Bake ingredients"}
            };

            _repositoryMock
                .Setup(r => r.GetUserFavoritesAsync(userId))
                .ReturnsAsync(expectedRecipes);

            // Act
            var result = await _service.GetUserFavoritesAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedRecipes.Count, result.Count());
            _repositoryMock
                .Verify(r => r.GetUserFavoritesAsync(userId), Times.Once);
        }

        [Fact]
        public async Task GetUserFavoritesAsync_EmptyUserId_ReturnsEmptyList()
        {
            // Arrange
            var userId = Guid.Empty;

            // Act
            var result = await _service.GetUserFavoritesAsync(userId);

            // Assert
            Assert.Empty(result);
            _repositoryMock
                .Verify(r => r.GetUserFavoritesAsync(It.IsAny<Guid>()), Times.Never);
        }
    }
}
