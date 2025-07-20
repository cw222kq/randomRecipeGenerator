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
        public async Task GetByGoogleUserIdAsync_ExisitngUser_ReturnUser()
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
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
