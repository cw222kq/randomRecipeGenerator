using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Services
{
    public interface IUserService
    {
        Task<User?> GetOrCreateUserAsync(UserDTO userDto);
    }
}
