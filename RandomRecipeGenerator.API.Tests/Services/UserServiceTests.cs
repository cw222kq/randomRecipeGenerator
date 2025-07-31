using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Repositories;
using AutoMapper;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<ILogger<UserService>> _loggerMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _loggerMock = new Mock<ILogger<UserService>>();
            _mapperMock = new Mock<IMapper>();
            _userService = new UserService(_userRepositoryMock.Object, _loggerMock.Object, _mapperMock.Object);

            // Setup mapper behavior
            _mapperMock
                .Setup(m => m.Map<User>(It.IsAny<UserDTO>()))
                .Returns((UserDTO dto) => new User
                {
                    GoogleUserId = dto.GoogleUserId,
                    Email = dto.Email,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName
                });
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
                GoogleUserId = userDto.GoogleUserId,
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
            Assert.Equal(expectedUser.GoogleUserId, result.GoogleUserId);
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
                GoogleUserId = userDto.GoogleUserId,
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

        [Fact]
        public async Task GetOrCreateUserAsync_NullUserDto_ReturnsNull()
        {
            // Act
            var result = await _userService.GetOrCreateUserAsync(null!);

            // Assert
            Assert.Null(result);
            _userRepositoryMock.Verify(r => r.GetByGoogleUserIdAsync(It.IsAny<string>()), Times.Never);
            _userRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_EmptyGoogleUserID_ReturnsNull()
        {
            // Arrange
            var userDto = new UserDTO
            {
                GoogleUserId = "",
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            // Act
            var result = await _userService.GetOrCreateUserAsync(userDto);

            // Assert
            Assert.Null(result);
            _userRepositoryMock.Verify(r => r.GetByGoogleUserIdAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_EmptyEmail_ResturnsNull()
        {
            // Arrange
            var userDto = new UserDTO
            {
                GoogleUserId = "12345",
                Email = "",
                FirstName = "John",
                LastName = "Doe"
            };

            // Act
            var result = await _userService.GetOrCreateUserAsync(userDto);

            // Assert
            Assert.Null(result);
            _userRepositoryMock.Verify(r => r.GetByGoogleUserIdAsync(It.IsAny<string>()), Times.Never);
        }
    }
}
