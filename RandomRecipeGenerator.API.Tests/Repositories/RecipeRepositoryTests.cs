using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Tests.Repositories
{
    public class RecipeRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly RecipeRepository _repository;
        private readonly Mock<ILogger<RecipeRepository>> _mockLogger;

        public RecipeRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<RecipeRepository>>();
            _repository = new RecipeRepository(_context, _mockLogger.Object);
        }

        [Fact]
        public async Task CreateRecipeAsync_WithValidRecipe_ReturnsCreatedRecipe()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            // Act
            var result = await _repository.CreateRecipeAsync(recipe);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(recipe.Title, result.Title);
            Assert.Equal(recipe.SpoonacularId, result.SpoonacularId);
            Assert.Equal(recipe.Ingredients, result.Ingredients);
            Assert.Equal(recipe.Instructions, result.Instructions);
            Assert.Equal(recipe.ImageUrl, result.ImageUrl);
            Assert.Equal(recipe.UserId, result.UserId);
            Assert.True(result.Id != Guid.Empty);
        }

        [Fact]
        public async Task GetRecipeByIdAsync_WithExistingRecipe_ReturnsRecipe()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _context.Users.Add(user);

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetRecipeByIdAsync(recipe.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(recipe.Title, result.Title);
            Assert.Equal(recipe.SpoonacularId, result.SpoonacularId);
            Assert.Equal(recipe.Ingredients, result.Ingredients);
            Assert.Equal(recipe.Instructions, result.Instructions);
            Assert.Equal(recipe.ImageUrl, result.ImageUrl);
            Assert.Equal(recipe.UserId, result.UserId);
        }

        [Fact]
        public async Task GetRecipeByIdAsync_WithNonExistentRecipe_ReturnsNull()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.GetRecipeByIdAsync(nonExistentId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetUserRecipeAsync_WithUserHavingRecipes_ReturnsUserRecipes()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _context.Users.Add(user);

            var recipes = new List<Recipe>
            {
                new() {
                    SpoonacularId = 12345,
                    Title = "Test Recipe",
                    Ingredients = ["Salt", "Pepper"],
                    Instructions = "Mix ingredients",
                    UserId = user.Id
                },
                new() {
                    SpoonacularId = 67890,
                    Title = "Another Test Recipe",
                    Ingredients = ["Sugar", "Flour"],
                    Instructions = "Bake ingredients",
                    UserId = user.Id
                },
            };

            _context.Recipes.AddRange(recipes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetUserRecipesAsync(user.Id);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, r => Assert.Equal(user.Id, r.UserId));

            var resultList = result.ToList();
            Assert.Contains(resultList, r => r.Title == "Test Recipe");
            Assert.Contains(resultList, r => r.Title == "Another Test Recipe");
        }

        [Fact]
        public async Task UpdateRecipeAsync_WithValidRecipe_ReturnsUpdatedRecipe()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _context.Users.Add(user);

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/original.jpg",
                UserId = user.Id,
            };

             _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Modify recipe
            recipe.Title = "Updated Title";
            recipe.Ingredients = ["Updated Ingredient"];
            recipe.Instructions = "Updated instructions";
            recipe.ImageUrl = "https://example.com/updated.jpg";

            // Act
            var result = await _repository.UpdateRecipeAsync(recipe);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", result.Title);
            Assert.Equal(["Updated Ingredient"], result.Ingredients);
            Assert.Equal("Updated instructions", result.Instructions);
            Assert.Equal("https://example.com/updated.jpg", result.ImageUrl);
            Assert.Equal(recipe.UserId, result.UserId);
            Assert.Equal(recipe.SpoonacularId, result.SpoonacularId);
        }

        [Fact]
        public async Task DeleteRecipeAsync_WithExistingRecipe_ReturnsTrue()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _context.Users.Add(user);

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/original.jpg",
                UserId = user.Id,
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteRecipeAsync(recipe.Id);

            // Assert
            Assert.True(result);
            var deletedRecipe = await _context.Recipes.FindAsync(recipe.Id);
            Assert.Null(deletedRecipe);
        }

        [Fact]
        public async Task DeleteRecipeAsync_WithNonExistentRecipe_ReturnsFalse()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.DeleteRecipeAsync(nonExistentId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task IsRecipeOwnerAsync_WithValidOwner_ReturnsTrue()
        {
            // Arrange
            var user = new User
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _context.Users.Add(user);

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/original.jpg",
                UserId = user.Id,
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.IsRecipeOwnerAsync(recipe.Id, user.Id);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsRecipeOwnerAsync_WithInvalidOwner_ReturnsFalse()
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
                Email = "firstname.lastname@example.com",
                FirstName = "firstname",
                LastName = "lastname"
            };

            _context.Users.Add(user);

            var recipe = new Recipe
            {
                SpoonacularId = 12345,
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/original.jpg",
                UserId = user.Id,
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.IsRecipeOwnerAsync(recipe.Id, anotherUser.Id);

            // Assert
            Assert.False(result);
        }
        
        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
