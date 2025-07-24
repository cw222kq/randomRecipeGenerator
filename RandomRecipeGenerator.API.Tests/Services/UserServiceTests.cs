using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Tests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<ILogger<UserService>> _loggerMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _loggerMock = new Mock<ILogger<UserService>>();
            _userService = new UserService(_userRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_NewUser_CreatesAndReturnsUser()
        {
            // Arrange
            var userDto = new UserDTO
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            _userRepositoryMock
                .Setup(r => r.GetByGoogleUserIdAsync(userDto.GoogleUserId))
                .ReturnsAsync((User?)null);

            var expectedUser = new User
            {
                GoogleUserID = userDto.GoogleUserId,
                Email = userDto.Email,
                FirstName = userDto.FirstName,
                LastName = userDto.LastName
            };

            _userRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<User>()))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _userService.GetOrCreateUserAsync(userDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedUser.GoogleUserID, result.GoogleUserID);
            Assert.Equal(expectedUser.Email, result.Email);

            _userRepositoryMock
                .Verify(r => r.GetByGoogleUserIdAsync(userDto.GoogleUserId), Times.Once);
            _userRepositoryMock
                .Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Once);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_ExistingUser_ReturnsExistingUser()
        {
            // Arrange
            var userDto = new UserDTO
            {
                GoogleUserId = "12345",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var existingUser = new User
            {
                GoogleUserID = userDto.GoogleUserId,
                Email = userDto.Email,
                FirstName = "Jane",
                LastName = "Smith"
            };

            _userRepositoryMock
                .Setup(r => r.GetByGoogleUserIdAsync(userDto.GoogleUserId))
                .ReturnsAsync(existingUser);

            // Act
            var result = await _userService.GetOrCreateUserAsync(userDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Jane", result.FirstName);
            Assert.Equal("Smith", result.LastName);

            _userRepositoryMock
                .Verify(r => r.GetByGoogleUserIdAsync(userDto.GoogleUserId), Times.Once);
            _userRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }
    }
}
