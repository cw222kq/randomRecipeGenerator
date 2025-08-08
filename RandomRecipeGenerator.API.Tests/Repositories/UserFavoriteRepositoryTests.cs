using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Tests.Repositories
{
    public class UserFavoriteRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UserFavoriteRepository _repository;
        private readonly Mock<ILogger<UserFavoriteRepository>> _mockLogger;

        public UserFavoriteRepositoryTests()
        { 
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<UserFavoriteRepository>>();
            _repository = new UserFavoriteRepository(_context, _mockLogger.Object);
        }

        [Fact]
        public async Task AddFavoriteAsync_ValidUserAndRecipe_ReturnsFavorite()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.AddFavoriteAsync(user.Id, recipe.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Id, result.UserId);
            Assert.Equal(recipe.Id, result.RecipeId);

            // Verify the favorite was saved to db
            var savedFavorite = await _context.UserFavoriteRecipes
                .FirstOrDefaultAsync(f => f.UserId == user.Id && f.RecipeId == recipe.Id);
        }

        [Fact]
        public async Task AddFavoriteAsync_DuplicateFavorite_ReturnsNull()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            // Add the favorite for the first time
            await _repository.AddFavoriteAsync(user.Id, recipe.Id);

            // Act
            var result = await _repository.AddFavoriteAsync(user.Id, recipe.Id);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task RemoveFavoriteAsync_ExistingFavorite_ReturnsTrue()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            // Add the favorite first
            await _repository.AddFavoriteAsync(user.Id, recipe.Id);

            // Act
            var result = await _repository.RemoveFavoriteAsync(user.Id, recipe.Id);

            // Assert
            Assert.True(result);

            // Verify the favorite was removed from db
            var favorite = await _context.UserFavoriteRecipes
                .FirstOrDefaultAsync(f => f.UserId == user.Id && f.RecipeId == recipe.Id);
            Assert.Null(favorite);
        }

        [Fact]
        public async Task RemoveFavoriteAsync_NonExistingFavorite_ReturnsFalse()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.RemoveFavoriteAsync(user.Id, recipe.Id);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task IsFavoriteAsync_ExistingFavorite_ReturnsTrue()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            // Add the favorite first
            await _repository.AddFavoriteAsync(user.Id, recipe.Id);

            // Act
            var result = await _repository.IsFavoriteAsync(user.Id, recipe.Id);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsFavoriteAsync_NonExistingFavorite_ReturnsFalse()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.IsFavoriteAsync(user.Id, recipe.Id);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetUserFavoritesAsync_UserWithFavorites_ReturnsRecipes()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var firstRecipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            var secondRecipe = new Recipe
            {
                SpoonacularId = 67890,
                Title = "Another Test Recipe",
                Ingredients = ["Sugar", "Flour"],
                Instructions = "Bake ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddRangeAsync(firstRecipe, secondRecipe);
            await _context.SaveChangesAsync();

            await _repository.AddFavoriteAsync(user.Id, firstRecipe.Id);
            await _repository.AddFavoriteAsync(user.Id, secondRecipe.Id);

            // Act
            var result = await _repository.GetUserFavoritesAsync(user.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, r => r.Title == firstRecipe.Title);
            Assert.Contains(result, r => r.Title == secondRecipe.Title);
        }

        [Fact]
        public async Task GetUserFavoritesAsync_UserWithNoFavorites_ReturnsEmpty()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var firstRecipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            var secondRecipe = new Recipe
            {
                SpoonacularId = 67890,
                Title = "Another Test Recipe",
                Ingredients = ["Sugar", "Flour"],
                Instructions = "Bake ingredients",
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddRangeAsync(firstRecipe, secondRecipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetUserFavoritesAsync(user.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
