using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class UserService(IUserRepository userRepository, ILogger<UserService> logger) : IUserService
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly ILogger<UserService> _logger = logger;

        public async Task<User?> GetOrCreateUserAsync(UserDTO userDto)
        {
            // Check if the user already exists
            var existingUser = await _userRepository.GetByGoogleUserIdAsync(userDto.GoogleUserId);
            if (existingUser != null)
            {
                return existingUser;
            }

            // If the user does not exist, create a new user
            var newUser = new User
            {
                GoogleUserId = userDto.GoogleUserId,
                Email = userDto.Email,
                FirstName = userDto.FirstName,
                LastName = userDto.LastName
            };

            return await _userRepository.CreateAsync(newUser);
        }
    }
}
