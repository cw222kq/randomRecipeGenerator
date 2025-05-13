using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.AspNetCore3;
using Microsoft.AspNetCore.Authentication.Cookies;
using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
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

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var firstName = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;
            var lastName = User.FindFirst(System.Security.Claims.ClaimTypes.Surname)?.Value;

            if (userId == null || email == null)
            {
                return BadRequest("External login failed.");
            }

            var userDTO = new UserDTO
            {
                GoogleUserId = userId,
                Email = email,
                FirstName = firstName ?? string.Empty,
                LastName = lastName ?? string.Empty,
            };
            
            var userJSON = System.Text.Json.JsonSerializer.Serialize(userDTO);
            Console.WriteLine(userJSON);

            return Redirect($"https://localhost:3000/hello");
        }
    }
}
