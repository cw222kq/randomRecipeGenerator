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
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.GoogleUserID == user.GoogleUserID || u.Email == user.Email))
            {
                return null; 
            }
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteAsync(Guid id)
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
    }
}
