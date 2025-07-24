using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Controllers;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Tests.Controllers
{
    public class AccountControllerTests
    {
        private readonly Mock<IOAuthService> _oauthServiceMock;
        private readonly Mock<ILogger<AccountController>> _loggerMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly AccountController _accountController;

        public AccountControllerTests()
        {
            _oauthServiceMock = new Mock<IOAuthService>();
            _userServiceMock = new Mock<IUserService>();
            _loggerMock = new Mock<ILogger<AccountController>>();
            _accountController = new AccountController(_oauthServiceMock.Object, _loggerMock.Object, _userServiceMock.Object);
        }

        [Fact]
        public async Task CompleteMobileAuth_NewUser_CreatesUserInDatabase()
        {
            // Arrange
            var request = new MobileAuthCompleteRequestDTO
            {
                Code = "auth_code_123",
                State = "state_123",
                RedirectUri = "randomrecipe://auth"
            };

            var googleUser = new UserDTO
            {
                GoogleUserId = "google_123",
                Email = "john.doe@example.com",
                FirstName = "John",
                LastName = "Doe"
            };

            var createdUser = new User
            {
                GoogleUserID = googleUser.GoogleUserId,
                Email = googleUser.Email,
                FirstName = googleUser.FirstName,
                LastName = googleUser.LastName
            };

            _oauthServiceMock
                .Setup(o => o.GetUserProfileAsync(It.IsAny<string>()))
                .ReturnsAsync(googleUser);

            _userServiceMock
                .Setup(o => o.GetOrCreateUserAsync(googleUser))
                .ReturnsAsync(createdUser);

            // Act
            var result = await _accountController.CompleteMobileAuth(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

           _userServiceMock.Verify(s => s.GetOrCreateUserAsync(googleUser), Times.Once);
        }
    }
}
