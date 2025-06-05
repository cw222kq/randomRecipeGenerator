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
    }
}
