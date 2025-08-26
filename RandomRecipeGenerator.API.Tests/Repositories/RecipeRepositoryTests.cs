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
                },
                new() {
                    SpoonacularId = 67890,
                    Title = "Another Test Recipe",
                    Ingredients = ["Sugar", "Flour"],
                    Instructions = "Bake ingredients",
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
            Assert.Contains(resultList, r => r.Title == "Recipe 1");
            Assert.Contains(resultList, r => r.Title == "Recipe 2");
        }
        
        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
