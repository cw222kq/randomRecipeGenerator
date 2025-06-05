using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Services
{
    public interface IHttpRequestService
    {
        Task<Recipe> Get(string url);
        Task<GoogleTokenResponseDTO?> PostFormAsync(string url, Dictionary<string, string> formData);
    }
}
