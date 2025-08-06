using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RandomRecipeGenerator.API.Data;

namespace RandomRecipeGenerator.API.Tests.Repositories
{
    public class UserFavoriteRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UserFavoriteRepository _repository;
        private readonly Mock<ILogger<UserFavoriteRepositoryTests>> _mockLogger;

        public UserFavoriteRepositoryTests()
        { 
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<UserFavoriteRepositoryTests>>();
            _repository = new UserFavoriteRepository(_context, _mockLogger.Object);
        }
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
