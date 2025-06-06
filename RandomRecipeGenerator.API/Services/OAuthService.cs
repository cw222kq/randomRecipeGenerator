using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Services
{
    public class OAuthService(IConfiguration configuration, IHttpRequestService httpRequestService, ILogger<OAuthService> logger) : IOAuthService
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IHttpRequestService _httpRequestService = httpRequestService;
        private readonly ILogger<OAuthService> _logger = logger;

        public async Task<GoogleTokenResponseDTO?> ExchangeCodeForTokens(string code, string redirectUri)
        {
            if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(redirectUri))
            {
                _logger.LogError("Invalid input parameters for token exchange.");
                return null;
            }

            try
            {
                var clientId = _configuration["Authentication:Google:ClientId"];
                var clientSecret = _configuration["Authentication:Google:ClientSecret"];

                if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
                {
                    _logger.LogError("Google OAuth client ID or/and secret is not configured properly.");
                    return null;
                }

                var tokenUrl = "https://oauth2.googleapis.com/token";
                var formData = new Dictionary<string, string>
                {
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["code"] = code,
                    ["grant_type"] = "authorization_code",
                    ["redirect_uri"] = redirectUri
                };

                _logger.LogInformation("Exchanging code for tokens with form data: {FormData}", formData);
                var tokenResponse = await _httpRequestService.PostFormAsync(tokenUrl, formData);

                if (tokenResponse == null)
                {
                    _logger.LogError("Failed to exchange authorization code for token");
                    return null;
                }

                _logger.LogInformation("Successfully exchanged authorization code for tokens");
                return tokenResponse;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while exchanging authorization code for tokens");
                return null;
            }
        }

        public string GenerateJwtToken(UserDTO user)
        {
            if (user == null)
            {
                _logger.LogError("User is null, cannot generate JWT token.");
                throw new ArgumentNullException(nameof(user), "User cannot be null when generating JWT token.");
            }

            try
            {
                var jwtKey = _configuration["Jwt:Key"];
                var jwtIssuer = _configuration["Jwt:Issuer"];
                var jwtAudience = _configuration["Jwt:Audience"];

                if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
                {
                    _logger.LogError("JWT configuration is not set properly.");
                    throw new InvalidOperationException("JWT configuration is not set properly.");
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.GoogleUserId),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
                    new Claim(ClaimTypes.Surname, user.LastName ?? string.Empty)
                };

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddDays(30),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                _logger.LogInformation("Successfully generated JWT token for user: {Email}", user.Email);
                return tokenString;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while generating JWT token");
                throw new InvalidOperationException("An error occurred while generating JWT token", ex);
            }
        }

        public async Task<UserDTO?> GetUserProfileAsync(string accessToken)
        {
           return await _httpRequestService.GetUserProfileAsync(accessToken);
        }
    }
}
