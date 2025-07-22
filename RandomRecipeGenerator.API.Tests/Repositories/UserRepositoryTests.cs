using System.Runtime.InteropServices;
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
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Use a unique in-memory database for each test run
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

        [Fact]
        public async Task CreateAsync_DuplicateGoogleUserId_ReturnsNull()
        {
            // Arrange
            var uniqueUser = new User
            {
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var duplicatedUser = new User
            {
                GoogleUserID = "12345", // Same GoogleUserID
                Email = "jane.doe@example.com",
                FirstName = "Jane",
                LastName = "Doe"
            };

            // Arrange
            await _context.Users.AddAsync(uniqueUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CreateAsync(duplicatedUser);

            // Assert
            Assert.Null(result); // Should return null due to duplicate GoogleUserID
        }

        [Fact]
        public async Task CreateAsync_DuplicateEmail_ReturnsNull()
        {
            // Arrange
            var uniqueUser = new User
            {
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var duplicatedUser = new User
            {
                GoogleUserID = "67890",
                Email = "john.doe@example.com", // Same email
                FirstName = "Jane",
                LastName = "Doe"
            };

            await _context.Users.AddAsync(uniqueUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CreateAsync(duplicatedUser);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateAsync_ExistingUser_UpdatesAndReturnsUser()
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

            // Modify user properties
            user.FirstName = "Jane";
            user.LastName = "Smith";

            // Act
            var result = await _repository.UpdateAsync(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Jane", result.FirstName);
            Assert.Equal("Smith", result.LastName);
            Assert.True(result.UpdatedAt > user.CreatedAt); // Ensure UpdatedAt is bigger than CreatedAt
        }

        [Fact]
        public async Task UpdateAsync_NonExistingUser_ReturnsNull()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(), // User doesn't exist in database
                GoogleUserID = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            // Act
            var result = await _repository.UpdateAsync(user);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteAsync_ExistingUser_ReturnsTrue()
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
            var result = await _repository.DeleteAsync(user.Id);

            // Assert
            Assert.True(result);

            // Verify that the user was removed from the context
            var deletedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
            Assert.Null(deletedUser);
        }

        [Fact]
        public async Task DeleteAsync_NonExistingUser_ReturnsFalse()
        {
            // Arrange
            var userId = "non-existing-id";

            // Act
            var result = await _repository.DeleteAsync(userId);

            // Assert
            Assert.False(result);
        }
        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this); // Suppress finalization for this object
        }
    }
}
