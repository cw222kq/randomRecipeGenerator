using AutoMapper;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;
using RandomRecipeGenerator.API.Repositories;

namespace RandomRecipeGenerator.API.Services
{
    public class UserService(IUserRepository userRepository, ILogger<UserService> logger, IMapper mapper) : IUserService
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly ILogger<UserService> _logger = logger;
        private readonly IMapper _mapper = mapper;

        public async Task<User?> GetOrCreateUserAsync(UserDTO userDto)
        {
            // Check if the user already exists
            var existingUser = await _userRepository.GetByGoogleUserIdAsync(userDto.GoogleUserId);
            if (existingUser != null)
            {
                return existingUser;
            }

            // If the user does not exist, create a new user
            var newUser = _mapper.Map<User>(userDto);

            return await _userRepository.CreateAsync(newUser);
        }
    }
}
