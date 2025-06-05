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
    public class AccountController(IOAuthService oAuthService) : ControllerBase
    {
        private readonly IOAuthService _oAuthService = oAuthService;

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

        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            // Clear the existing external cookie
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return Redirect("https://localhost:3000/");
        }

        [HttpPost("mobile-auth-init")]
        public IActionResult InitiateMobileAuth([FromBody] MobileAuthRequestDTO request)
        {
            try
            {
                // Generate secure state parameter, protect against CSRF
                var state = Guid.NewGuid().ToString();
                var nonce = Guid.NewGuid().ToString();

                HttpContext.Session.SetString($"oauth_state_{state}", nonce);

                var clientId = HttpContext.RequestServices.
                    GetRequiredService<IConfiguration>()["Authentication:Google:ClientId"];

                if (string.IsNullOrEmpty(clientId))
                {
                    return BadRequest("Client ID is not configured.");
                }

                // Generate GoogleOauth URL
                var authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                    $"client_id={Uri.EscapeDataString(clientId)}&" +
                    $"redirect_uri={Uri.EscapeDataString(request.RedirectUri)}&" +
                    $"response_type=code&" +
                    $"scope={Uri.EscapeDataString("openid email profile")}&" +
                    $"state={Uri.EscapeDataString(state)}&" +
                    $"access_type=offline&" +
                    $"prompt=select_account";

                return Ok(new
                {
                    AuthUrl = authUrl,
                    State = state
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initiating mobile authentication: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while initiating mobile authentication.");
            }
        }

        [HttpPost("mobile-auth-complete")]
        public async Task<IActionResult> CompleteMobileAuth([FromBody] MobileAuthCompleteRequestDTO request)
        {
            try
            {
                // Validate state parameter for CSRF protection
                var storedNonce = HttpContext.Session.GetString($"oauth_state_{request.State}");
                if (string.IsNullOrEmpty(storedNonce))
                {
                    Console.WriteLine("Invalid or expired OAuth state");
                    return BadRequest("Invalid or expired authentication state");
                }

                HttpContext.Session.Remove($"oauth_state_{request.State}");

                var tokenResponse = await _oAuthService.ExchangeCodeForTokens(request.Code, request.RedirectUri);
                if (tokenResponse == null)
                {
                    Console.WriteLine("Failed to exchange authorization code for tokens");
                    return BadRequest("Failed to exchange authorization code for tokens");
                }

                var userProfileResponse = await _oAuthService.GetUserProfileAsync(tokenResponse.AccessToken);
                if (userProfileResponse == null)
                {
                    Console.WriteLine("Failed to retrieve user profile");
                    return BadRequest("Failed to retrieve user profile");
                }

  
                return Ok(new MobileAuthCompleteResponseDTO
                {
                    User = userProfileResponse,
                    Token = "placeholder-jwt-token",
                    ExpiresAt = DateTime.UtcNow.AddDays(30).ToString("O")
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Mobile auth complete error: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Authentication failed");
            }
        }
    }
}
