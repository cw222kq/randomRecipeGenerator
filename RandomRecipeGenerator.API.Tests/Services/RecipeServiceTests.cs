using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Services
{
    public class RecipeServiceTests
    {
        private readonly Mock<IRecipeRepository> _recipeRepositoryMock;
        private readonly Mock<ILogger<RecipeService>> _loggerMock;
        private readonly RecipeService _recipeService;

        public RecipeServiceTests()
        {
            _recipeRepositoryMock = new Mock<IRecipeRepository>();
            _loggerMock = new Mock<ILogger<RecipeService>>();
            _recipeService = new RecipeService(_recipeRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateUserRecipeAsync_WithValidDate_ReturnsCreatedRecipe()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var title = "Test Recipe";
            var ingredients = new List<string> { "Salt", "Pepper" };
            var instructions = "Mix ingredients";
            var imageUrl = "https://example.com/image.jpg";

            var expectedRecipe = new Recipe
            {
                Id = Guid.NewGuid(),
                Title = title,
                SpoonacularId = 0,
                Ingredients = ingredients,
                Instructions = instructions,
                ImageUrl = imageUrl,
                UserId = userId
            };

            _recipeRepositoryMock
                .Setup(r => r.CreateRecipeAsync(It.IsAny<Recipe>()))
                .ReturnsAsync(expectedRecipe);

            // Act
            var result = await _recipeService.CreateUserRecipeAsync(userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(title, result.Title);
            Assert.Equal(userId, result.UserId);
            Assert.Equal(0, result.SpoonacularId); // User-created recipes have SpoonacularId = 0
            _recipeRepositoryMock
                .Verify(r => r.CreateRecipeAsync(It.Is<Recipe>(recipe => 
                    recipe.Title == title &&
                    recipe.UserId == userId &&
                    recipe.SpoonacularId == 0)), Times.Once());
        }

        [Fact]
        public async Task CreateUserRecipeAsync_WithEmptyUserId_ReturnsNull()
        {
            // Arrange
            var userId = Guid.Empty;
            var title = "Test Recipe";
            var ingredients = new List<string> { "Salt", "Pepper" };
            var instructions = "Mix ingredients";
            var imageUrl = "https://example.com/image.jpg";

            // Act
            var result = await _recipeService.CreateUserRecipeAsync(userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.Null(result);
            _recipeRepositoryMock
                .Verify(r => r.CreateRecipeAsync(It.IsAny<Recipe>()), Times.Never());
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        [InlineData(" ")]
        public async Task CreatedUserRecipeAsync_WithInvalidTitle_ReturnsNull(string title)
        {
            // Arrange
            var userId = Guid.NewGuid();
            var ingredients = new List<string> { "Salt", "Pepper" };
            var instructions = "Mix ingredients";
            var imageUrl = "https://example.com/image.jpg";

            // Act
            var result = await _recipeService.CreateUserRecipeAsync(userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.Null(result);
            _recipeRepositoryMock
                .Verify(r => r.CreateRecipeAsync(It.IsAny<Recipe>()), Times.Never);
        }

        [Fact]
        public async Task CreateUserRecipeAsync_WithEmptyIngredients_ReturnsNull()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var title = "Test Recipe";
            var ingredients = new List<string>();
            var instructions = "Mix ingredients";
            var imageUrl = "https://example.com/image.jpg";

            // Act
            var result = await _recipeService.CreateUserRecipeAsync(userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.Null(result);
            _recipeRepositoryMock
                .Verify(r => r.CreateRecipeAsync(It.IsAny<Recipe>()), Times.Never);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        [InlineData(" ")]
        public async Task CreateUserRecipeAsync_WithInvalidInstuctions_ReturnsNull(string instructions)
        {
            // Arrange
            var userId = Guid.NewGuid();
            var title = "Test Recipe";
            var ingredients = new List<string>();
            var imageUrl = "https://example.com/image.jpg";

            // Act
            var result = await _recipeService.CreateUserRecipeAsync(userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.Null(result);
            _recipeRepositoryMock
                .Verify(r => r.CreateRecipeAsync(It.IsAny<Recipe>()), Times.Never);
        }

        [Fact]
        public async Task GetRecipeByIdAsync_WithValidId_CallsRepository()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var expectedRecipe = new Recipe
            {
                Id = recipeId,
                Title = "Test Recipe",
                SpoonacularId = 0,
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/image.jpg"
            };

            _recipeRepositoryMock
                .Setup(r => r.GetRecipeByIdAsync(recipeId))
                .ReturnsAsync(expectedRecipe);

            // Act
            var result = await _recipeService.GetRecipeByIdAsync(recipeId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(recipeId, result.Id);
            _recipeRepositoryMock
                .Verify(r => r.GetRecipeByIdAsync(recipeId), Times.Once);
        }

        [Fact]
        public async Task GetUserRecipesAsync_WithValidUserId_CallsRepository()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var expectedRecipe = new List<Recipe>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Test Recipe",
                    SpoonacularId = 0,
                    Ingredients = ["Salt", "Pepper"],
                    Instructions = "Mix ingredients",
                    ImageUrl = "https://example.com/image.jpg"
                },
                new() 
                {
                    Id = Guid.NewGuid(),
                    Title = "Test Recipe 2",
                    SpoonacularId = 0,
                    Ingredients = ["Olives", "Sugar"],
                    Instructions = "Chop the olives",
                    ImageUrl = "https://anotherexample.com/image.jpg"
                }    
            };

            _recipeRepositoryMock
                .Setup(r => r.GetUserRecipesAsync(userId))
                .ReturnsAsync(expectedRecipe);

            // Act
            var result = await _recipeService.GetUserRecipesAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            _recipeRepositoryMock
                .Verify(r => r.GetUserRecipesAsync(userId), Times.Once);
        }

        [Fact]
        public async Task UpdateUserRecipeAsync_WithValidOwnership_ReturnsUpdatedRecipe()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var title = "Updated Recipe Title";
            var ingredients = new List<string> { "New Ingredient" };
            var instructions = "Updated instructions";
            var imageUrl = "https://updatedexample.com/image.jpg";

            var existingRecipe = new Recipe
            {
                Id = recipeId,
                Title = "Old Recipe Title",
                SpoonacularId = 0,
                Ingredients = ["Old Salt", "Old Pepper"],
                Instructions = "Old Mix ingredients",
                ImageUrl = "https://oldexample.com/image.jpg",
                UserId = userId
            };

            var updatedRecipe = new Recipe
            {
                Id = recipeId,
                Title = title,
                SpoonacularId = 0,
                Ingredients = ingredients,
                Instructions = instructions,
                ImageUrl = imageUrl,
                UserId = userId
            };

            _recipeRepositoryMock
                .Setup(r => r.IsRecipeOwnerAsync(recipeId, userId))
                .ReturnsAsync(true);

            _recipeRepositoryMock
                .Setup(r => r.GetRecipeByIdAsync(recipeId))
                .ReturnsAsync(existingRecipe);

            _recipeRepositoryMock
                .Setup(r => r.UpdateRecipeAsync(It.IsAny<Recipe>()))
                .ReturnsAsync(updatedRecipe);

            // Act
            var result = await _recipeService.UpdateUserRecipeAsync(recipeId, userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(title, result.Title);
            Assert.Equal(ingredients, result.Ingredients);
            Assert.Equal(instructions, result.Instructions);
            _recipeRepositoryMock
                .Verify(r => r.IsRecipeOwnerAsync(recipeId, userId), Times.Once);
            _recipeRepositoryMock
                .Verify(r => r.UpdateRecipeAsync(It.IsAny<Recipe>()), Times.Once);
        }

        [Fact]
        public async Task UpdateUserRecipeAsync_WithInvalidOwnership_ReturnsNull()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var title = "Updated Recipe Title";
            var ingredients = new List<string> { "New Ingredient" };
            var instructions = "Updated instructions";
            var imageUrl = "https://updatedexample.com/image.jpg";

            _recipeRepositoryMock
                .Setup(r => r.IsRecipeOwnerAsync(recipeId, userId))
                .ReturnsAsync(false);

            // Act
            var result = await _recipeService.UpdateUserRecipeAsync(recipeId, userId, title, ingredients, instructions, imageUrl);

            // Assert
            Assert.Null(result);
            _recipeRepositoryMock
                .Verify(r => r.IsRecipeOwnerAsync(recipeId, userId), Times.Once);
            _recipeRepositoryMock
                .Verify(r => r.UpdateRecipeAsync(It.IsAny<Recipe>()), Times.Never);
        }

        [Fact]
        public async Task DeleteUserRecipeAsync_WithValidOwnership_ReturnsTrue()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            _recipeRepositoryMock
                .Setup(r => r.IsRecipeOwnerAsync(recipeId, userId))
                .ReturnsAsync(true);

            _recipeRepositoryMock
                .Setup(r => r.DeleteRecipeAsync(recipeId))
                .ReturnsAsync(true);

            // Act
            var result = await _recipeService.DeleteUserRecipeAsync(recipeId, userId);

            // Assert
            Assert.True(result);
            _recipeRepositoryMock
                .Verify(r => r.IsRecipeOwnerAsync(recipeId, userId), Times.Once);
            _recipeRepositoryMock
                .Verify(r => r.DeleteRecipeAsync(recipeId), Times.Once);
        }

        [Fact]
        public async Task DeleteUserRecipeAsync_WithInvalidOwnership_ReturnsFalse()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            _recipeRepositoryMock
                .Setup(r => r.IsRecipeOwnerAsync(recipeId, userId))
                .ReturnsAsync(false);

            // Act
            var result = await _recipeService.DeleteUserRecipeAsync(recipeId, userId);

            // Assert
            Assert.False(result);
            _recipeRepositoryMock
                .Verify(r => r.IsRecipeOwnerAsync(recipeId, userId), Times.Once);
            _recipeRepositoryMock
                .Verify(r => r.DeleteRecipeAsync(recipeId), Times.Never);
        }

        [Fact]
        public async Task IsRecipeOwnerAsync_WithValidInput_CallsRepository()
        {
            // Arrange
            var recipeId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            _recipeRepositoryMock
                .Setup(r => r.IsRecipeOwnerAsync(recipeId, userId))
                .ReturnsAsync(true);

            // Act
            var result = await _recipeService.IsRecipeOwnerAsync(recipeId, userId);

            // Assert
            Assert.True(result);
            _recipeRepositoryMock
                .Verify(r => r.IsRecipeOwnerAsync(recipeId, userId), Times.Once);
        }
    }
}
