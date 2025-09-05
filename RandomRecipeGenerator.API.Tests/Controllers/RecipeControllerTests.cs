using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Controllers;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Services;
using RandomRecipeGenerator.API.Models.Exceptions;
using Xunit;

namespace RandomRecipeGenerator.API.Tests.Controllers
{
    public class RecipeControllerTests
    {
        private readonly Mock<IHttpRequestService> _httpRequestServiceMock;
        private readonly Mock<IRecipeService> _recipeServiceMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<RecipeController>> _loggerMock;

        private readonly RecipeController _controller;

        public RecipeControllerTests()
        {
            _httpRequestServiceMock = new Mock<IHttpRequestService>();
            _recipeServiceMock = new Mock<IRecipeService>();
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<RecipeController>>();

            _controller = new RecipeController(
                _httpRequestServiceMock.Object,
                _recipeServiceMock.Object,
                _mapperMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task Get_WhenServiceSucceds_ReturnOkWithRecipeDTO()
        {
            //Arrange
            var fakeDomainRecipe = new Recipe
            {
                Id = Guid.NewGuid(),
                SpoonacularId = 1,
                Title = "Test Recipe",
                Ingredients = [ "Ingredient X", "Ingredient Y" ],
                Instructions = "Mix all the ingredients together.",
                ImageUrl = "https://example.com/image.jpg"
            };

            var fakeRecipeDTO = new RecipeDTO
            {
                Id = fakeDomainRecipe.Id,
                Title = fakeDomainRecipe.Title,
                Ingredients = fakeDomainRecipe.Ingredients,
                Instructions = fakeDomainRecipe.Instructions,
                ImageUrl = fakeDomainRecipe.ImageUrl
            };

            _httpRequestServiceMock
                .Setup(service => service.Get(It.IsAny<string>()))
                .ReturnsAsync(fakeDomainRecipe);

            _mapperMock
                .Setup(mapper => mapper.Map<RecipeDTO>(fakeDomainRecipe))
                .Returns(fakeRecipeDTO);

            // Act
            var actionResult = await _controller.Get();

            // Asssert
            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            var returnedDTO = Assert.IsType<RecipeDTO>(okResult.Value);
            Assert.Equal(fakeRecipeDTO.Id, returnedDTO.Id);
            Assert.Equal(fakeRecipeDTO.Title, returnedDTO.Title);
            Assert.Equal(fakeRecipeDTO.Ingredients, returnedDTO.Ingredients);
            Assert.Equal(fakeRecipeDTO.Instructions, returnedDTO.Instructions);
            Assert.Equal(fakeRecipeDTO.ImageUrl, returnedDTO.ImageUrl);
        }

        [Fact]
        public async Task Get_WhenServiceThrowsRecipeParsingException_ReturnsInternalServerError()
        {
            var fakeRecipeParsingException = new RecipeParsingException("fake parsing error message");

            _httpRequestServiceMock
                .Setup(service => service.Get(It.IsAny<string>()))
                .ThrowsAsync(fakeRecipeParsingException);

            // Act
            var actionResult = await _controller.Get();

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(actionResult);

            Assert.Equal(500, objectResult.StatusCode);
            var errorResponse = Assert.IsType<ErrorResponseDTO>(objectResult.Value);
            Assert.Equal(fakeRecipeParsingException.Message, errorResponse.Message);
        }

        [Fact]
        public async Task Get_WhenServiceThrowsRecipeAPIException_ReturnsInternalServerError()
        {
            var fakeRecipeAPIException = new RecipeAPIException("fake API error message");

            _httpRequestServiceMock
                .Setup(service => service.Get(It.IsAny<string>()))
                .ThrowsAsync(fakeRecipeAPIException);

            // Act
            var actionResult = await _controller.Get();

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(actionResult);

            Assert.Equal(500, objectResult.StatusCode);
            var errorResponse = Assert.IsType<ErrorResponseDTO>(objectResult.Value);
            Assert.Equal(fakeRecipeAPIException.Message, errorResponse.Message);    
        }

        [Fact]
        public async Task CreateUserRecipe_ValidInput_ReturnsCreated()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var recipeRequest = new RecipeRequestDTO
            {
                Title = "Test Recipe",
                Ingredients = ["Salt", "Pepper"],
                Instructions = "Mix ingredients",
                ImageUrl = "https://example.com/image.jpg"
            };

            var createdRecipe = new Recipe
            {
                Id = Guid.NewGuid(),
                Title = recipeRequest.Title,
                SpoonacularId = 0,
                Ingredients = recipeRequest.Ingredients,
                Instructions = recipeRequest.Instructions,
                ImageUrl = recipeRequest.ImageUrl,
                UserId = userId
            };

            var recipeDTO = _mapperMock.Object.Map<RecipeDTO>(createdRecipe);

            _recipeServiceMock
                .Setup(s => s.CreateUserRecipeAsync(userId, recipeRequest.Title, recipeRequest.Ingredients, recipeRequest.Instructions, recipeRequest.ImageUrl))
                .ReturnsAsync(createdRecipe);

            _mapperMock
                .Setup(m => m.Map<RecipeDTO>(createdRecipe))
                .Returns(recipeDTO);

            // Act
            var result = await _controller.CreateUserRecipe(userId, recipeRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(RecipeController.GetUserRecipe), createdResult.ActionName);
            Assert.Equal(recipeDTO, createdResult.Value);
        }
    }
}
