using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Services
{
    public interface IOAuthService
    {
        Task<GoogleTokenResponseDTO?> ExchangeCodeForTokens(string code, string redirectUri);
        Task<UserDTO?> GetUserProfileAsync(string accessToken);
        string GenerateJwtToken(UserDTO user);
    }
}
