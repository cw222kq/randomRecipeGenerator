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
                    return null;
                }
                var existingByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
                if (existingByEmail != null)
                {
                    return null;
                }

                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return user;
            }
            catch
            {
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
                    return false;
                }
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch 
            {
                return false;
            }
            
        }

        public Task<User?> GetByEmailAsync(string email)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public Task<User?> GetByGoogleUserIdAsync(string googleUserId)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.GoogleUserID == googleUserId);
        }

        public Task<User?> GetByIdAsync(Guid id)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> UpdateAsync(User user)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(user.Id);
                if (existingUser == null)
                {
                    return null;
                }
                user.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return user;
            }
            catch 
            {
                return null;
            }
            
        }
    }
}
