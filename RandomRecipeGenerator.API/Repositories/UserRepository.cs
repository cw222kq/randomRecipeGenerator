using Microsoft.EntityFrameworkCore;
using RandomRecipeGenerator.API.Data;
using RandomRecipeGenerator.API.Models.Domain;

namespace RandomRecipeGenerator.API.Repositories
{
    public class UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger) : IUserRepository
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<UserRepository> _logger = logger;

        public async Task<User?> CreateAsync(User user)
        {
            try
            {
                // Check if user already exists
                var existingByGoogleId = await _context.Users.FirstOrDefaultAsync(u => u.GoogleUserID == user.GoogleUserID);
                if (existingByGoogleId != null)
                {
                    _logger.LogWarning("User with Google ID {GoogleUserId} already exists.", user.GoogleUserID);
                    return null;
                }
                var existingByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
                if (existingByEmail != null)
                {
                    _logger.LogWarning("User with email {Email} already exists.", user.Email);
                    return null;
                }

                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User with ID {UserId} created successfully.", user.Id);
                return user;
            }
            catch (Exception)
            {
                _logger.LogError("Error creating user with email {Email}.", user.Email);
                return null;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try 
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found for deletion.", id);
                    return false;
                }
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User with ID {UserId} deleted successfully.", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}.", id);
                return false;
            }
            
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with email {Email}.", email);
                return null;
            }

        }

        public async Task<User?> GetByGoogleUserIdAsync(string googleUserId)
        {
            try
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.GoogleUserID == googleUserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with Google ID {GoogleUserId}.", googleUserId);
                return null;
            }

        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            try
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {UserId}.", id);
                return null;
            }
        }

        public async Task<User?> UpdateAsync(User user)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(user.Id);
                if (existingUser == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found for update.", user.Id);
                    return null;
                }
                user.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User with ID {UserId} updated successfully.", user.Id);
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {UserId}.", user.Id);
                return null;
            }
            
        }
    }
}
