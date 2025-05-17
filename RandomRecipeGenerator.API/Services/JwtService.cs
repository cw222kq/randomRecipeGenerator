using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RandomRecipeGenerator.API.Models.Configuration;
using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Services
{
    public class JwtService(IOptions<JwtSettings> jwtSettings) : IJwtService
    {
        private readonly JwtSettings _jwtSettings = jwtSettings.Value;
        public string GenerateToken(UserDTO user)
        {
            // create claims
            var claims = new List<Claim>
            {
                new ("GoogleUserId", user.GoogleUserId),
                new (ClaimTypes.Email, user.Email),
                new ("FirstName", user.FirstName ?? string.Empty),
                new ("LastName", user.LastName ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            // create the JWT token
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
                signingCredentials: credentials
            );

            Console.WriteLine($"Token: {new JwtSecurityTokenHandler().WriteToken(token)}");

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
