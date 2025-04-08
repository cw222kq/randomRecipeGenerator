using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Services
{
    public interface IHttpRequestService
    {
        Task<Recipe> Get(string url);
    }
}
