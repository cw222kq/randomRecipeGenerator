using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Services
{
    public class OAuthService() : IOAuthService
    {
        public Task<GoogleTokenResponseDTO?> ExchangeCodeForTokens(string code, string redirectUri)
        {
            throw new NotImplementedException();
        }
    }
}
