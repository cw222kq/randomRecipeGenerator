namespace RandomRecipeGenerator.API.Models.DTO
{
    public class GoogleTokenResponseDTO
    {
        public string AccessToken { get; set; } = string.Empty;
        public string IdToken { get; set; } = string.Empty;
        public string ExpiresIn { get; set; } = string.Empty;
    }
}
