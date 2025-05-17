using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(UserDTO user);
    }
}
