using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;


namespace RandomRecipeGenerator.API.Tests.Repositories
{
    public class UserRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UserRepository _repository;
        private readonly Mock<ILogger<UserRepository>> _mockLogger;

        public UserRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;
            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<UserRepository>>();
            _repository = new UserRepository(_context, _mockLogger.Object);
            
        }

        [Fact]
        public async Task GetByGoogleUserIdAsync_ExistingUser_ReturnsUser()
        {
            // Arrange
            var user = new User
            {
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByGoogleUserIdAsync(user.GoogleUserID);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.GoogleUserID, result.GoogleUserID);
            Assert.Equal(user.Email, result.Email);
            Assert.Equal(user.FirstName, result.FirstName);
            Assert.Equal(user.LastName, result.LastName);
        }

        [Fact]
        public async Task GetByGoogleUserIDAsync_NonExistingUser_ReturnsNull()
        {
            // Arrange
            var googleUserId = "non-existing-googleUserId";

            // Act
            var result = await _repository.GetByGoogleUserIdAsync(googleUserId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByEmailAsync_ExistingUser_ReturnsUser()
        {
            // Arrange
            var user = new User
            {
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByEmailAsync(user.Email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.GoogleUserID, result.GoogleUserID);
            Assert.Equal(user.Email, result.Email);
        }

        [Fact]
        public async Task GetByEmailAsync_NonExistingUser_ReturnsNull()
        {
            // Arrange
            var googleUserEmail = "non-existing-email";

            // Act
            var result = await _repository.GetByGoogleUserIdAsync(googleUserEmail);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByIdAsync_ExisingUser_ReturnsUser()
        {
            // Arrange
            var user = new User
            {
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(user.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Id, result.Id);
            Assert.Equal(user.GoogleUserID, result.GoogleUserID);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
        {
            // Arrange
            var userId = "non-existing-id";

            // Act
            var result = await _repository.GetByIdAsync(userId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_ValidUser_CreatesAndReturnsUser()
        {
            // Arrange
            var user = new User
            {
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            // Act
            var result = await _repository.CreateAsync(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.GoogleUserID, result.GoogleUserID);
            Assert.Equal(user.Email, result.Email);
            Assert.True(result.Id != Guid.Empty); // Ensure Id is generated
            Assert.True(result.CreatedAt != default);
            Assert.True(result.UpdatedAt != default);

            // Verify that the user was added to the context
            var addedUser = await _context.Users.FirstOrDefaultAsync(u => u.GoogleUserID == result.GoogleUserID);
            Assert.NotNull(addedUser);

        }
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
