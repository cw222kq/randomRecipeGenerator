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
                UserId = null
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

            // Verify ownership transfer
            var updateRecipe = await _context.Recipes.FindAsync(recipe.Id);
            Assert.NotNull(updateRecipe);
            Assert.Equal(user.Id, updateRecipe.UserId);

            // Verify the favorite was saved to db
            var savedFavorite = await _context.UserFavoriteRecipes
                .FirstOrDefaultAsync(f => f.UserId == user.Id && f.RecipeId == recipe.Id);
            Assert.NotNull(savedFavorite);
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
        public async Task AddFavoriteAsync_SpoonacularRecipe_TransfersOwnership()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var spoonacularRecipe = new Recipe
            {
                SpoonacularId = 98765,
                Title = "Spoonacular Recipe",
                Ingredients = ["Tomato", "Basil"],
                Instructions = "Cook together",
                UserId = null
            };

            await _context.Users.AddAsync(user);
            await _context.Recipes.AddAsync(spoonacularRecipe);
            await _context.SaveChangesAsync();

            var originalUpdatedAt = spoonacularRecipe.UpdatedAt;

            // Act
            var result = await _repository.AddFavoriteAsync(user.Id, spoonacularRecipe.Id);

            // Assert
            Assert.NotNull(result);

            // Verify ownership transfer
            var updatedRecipe = await _context.Recipes.FindAsync(spoonacularRecipe.Id);
            Assert.NotNull(updatedRecipe);
            Assert.Equal(user.Id, updatedRecipe.UserId);
            Assert.True(updatedRecipe.UpdatedAt > originalUpdatedAt);
        }

        [Fact]
        public async Task AddFavoriteAsync_UserOwnedRecipe_NoOwnershipChange()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var anotherUser = new User
            {
                GoogleUserId = "67890",
                Email = "sandy.smith@example.com",
                FirstName = "Sandy",
                LastName = "Smith"
            };

            var userOwnedRecipe = new Recipe
            {
                SpoonacularId = 0,
                Title = "User Recipe",
                Ingredients = ["Tomato", "Basil"],
                Instructions = "Cook together",
                UserId = user.Id,
            };

            await _context.Users.AddRangeAsync(user, anotherUser);
            await _context.Recipes.AddAsync(userOwnedRecipe);
            await _context.SaveChangesAsync();

            // Act - anotherUser favorites user's recipe
            var result = await _repository.AddFavoriteAsync(anotherUser.Id, userOwnedRecipe.Id);

            // Assert
            Assert.NotNull(result);

            // Verify ownership DOES NOT change
            var recipe = await _context.Recipes.FindAsync(userOwnedRecipe.Id);
            Assert.NotNull(recipe);
            Assert.Equal(user.Id, recipe.UserId);
            Assert.NotEqual(anotherUser.Id, recipe.UserId);
        }

        [Fact]
        public async Task AddFavoriteAsync_RecipeNotFound_ReturnsNull()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var nonExistentRecipeId = Guid.NewGuid();

            // Act
            var result = await _repository.AddFavoriteAsync(user.Id, nonExistentRecipeId);

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
