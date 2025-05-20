using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.AspNetCore3;
using Microsoft.AspNetCore.Authentication.Cookies;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Services;

namespace RandomRecipeGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController() : ControllerBase
    {
        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(GoogleLoginCallback))
            };
            // Redirect to the Google login page
            return Challenge(properties, GoogleOpenIdConnectDefaults.AuthenticationScheme);
        }

        [HttpGet("google-login-callback")]
        public IActionResult GoogleLoginCallback()
        {
            if (User.Identity == null || !User.Identity.IsAuthenticated)
            {
                return BadRequest("External login failed.");
            }

            return Redirect("https://localhost:3000/hello");
        }

        [HttpGet("user")]
        public IActionResult GetCurrentUser()
        {
            if (User.Identity == null || !User.Identity.IsAuthenticated)
            {
                return Unauthorized();
            }
           
            var userDTO = new UserDTO
            {
                GoogleUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty,
                Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? string.Empty,
                FirstName = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value ?? string.Empty,
                LastName = User.FindFirst(System.Security.Claims.ClaimTypes.Surname)?.Value ?? string.Empty,
            };

            return Ok(userDTO);
        }
    }
}
