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
            if (userDto == null)
            {
                _logger.LogError("UserDTO is null");
                return null;
            }

            if (string.IsNullOrWhiteSpace(userDto.GoogleUserId))
            {
                _logger.LogError("GoogleUserId is null or empty");
                return null;
            }

            if (string.IsNullOrWhiteSpace(userDto.Email))
            {
                _logger.LogError("Email is null or empty");
                return null;
            }

            _logger.LogInformation("Attempting to get or create user for Google ID: {GoogleUserId}, Email: {Email}",
                userDto.GoogleUserId, userDto.Email);

            try
            {
                // Check if the user already exists
                var existingUser = await _userRepository.GetByGoogleUserIdAsync(userDto.GoogleUserId);
                if (existingUser != null)
                {
                    _logger.LogInformation("User already exists for Google ID: {GoogleUserId}, Email: {Email} - returning existing user",
                        userDto.GoogleUserId, userDto.Email);
                    return existingUser;
                }

                _logger.LogInformation("User not found, creating new user for Google ID: { GoogleUserId}, Email: { Email}",
                    userDto.GoogleUserId, userDto.Email);

                // If the user does not exist, create a new user
                var newUser = _mapper.Map<User>(userDto);
                var createdUser = await _userRepository.CreateAsync(newUser);

                if (createdUser == null)
                {
                    _logger.LogError("Failed to create user for Google ID: {GoogleUserId}, Email: {Email}",
                        userDto.GoogleUserId, userDto.Email);
                    return null;
                }

                _logger.LogInformation("User created successfully for Google ID: {GoogleUserId}, Email: {Email}",
                    userDto.GoogleUserId, userDto.Email);

                return createdUser;

            } catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting or creating user for Google ID: {GoogleUserId}, Email: {Email}",
                    userDto.GoogleUserId, userDto.Email);
                return null;
            }
        }

        async Task<User?> IUserService.GetUserByGoogleIdAsync(string googleUserId)
        {
            if (string.IsNullOrWhiteSpace(googleUserId))
            {
                _logger.LogError("GoogleUserId is null or empty");
                return null;
            }

            try
            {
                return await _userRepository.GetByGoogleUserIdAsync(googleUserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by Google ID: {GoogleuserId}", googleUserId);
                return null;
            }
        }
    }
}
