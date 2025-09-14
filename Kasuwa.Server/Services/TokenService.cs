using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Kasuwa.Server.Data;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public interface ITokenService
    {
        Task<string> GenerateJwtTokenAsync(ApplicationUser user);
        Task<RefreshToken> GenerateRefreshTokenAsync(string userId);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task<bool> ValidateRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token, string? reason = null);
        Task RevokeAllRefreshTokensAsync(string userId, string? reason = null);
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }
    
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TokenService> _logger;
        
        public TokenService(
            IConfiguration configuration, 
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<TokenService> logger)
        {
            _configuration = configuration;
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }
        
        public async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);
            
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim("userType", user.UserType.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };
            
            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }
            
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"] ?? "DefaultSecretKey"));
            
            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.UtcNow.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        public async Task<RefreshToken> GenerateRefreshTokenAsync(string userId)
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            var token = Convert.ToBase64String(randomNumber);
            
            var refreshTokenValidityInDays = int.Parse(_configuration["JWT:RefreshTokenValidityInDays"] ?? "7");
            
            var refreshToken = new RefreshToken
            {
                UserId = userId,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddDays(refreshTokenValidityInDays),
                CreatedDate = DateTime.UtcNow
            };
            
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            
            return refreshToken;
        }
        
        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }
        
        public async Task<bool> ValidateRefreshTokenAsync(string token)
        {
            var refreshToken = await GetRefreshTokenAsync(token);
            return refreshToken != null && refreshToken.IsActive;
        }
        
        public async Task RevokeRefreshTokenAsync(string token, string? reason = null)
        {
            var refreshToken = await GetRefreshTokenAsync(token);
            if (refreshToken != null && refreshToken.IsActive)
            {
                refreshToken.IsRevoked = true;
                refreshToken.RevokedDate = DateTime.UtcNow;
                refreshToken.ReasonRevoked = reason ?? "Token revoked";
                
                await _context.SaveChangesAsync();
                _logger.LogInformation("Refresh token revoked for user {UserId}: {Reason}", refreshToken.UserId, reason);
            }
        }
        
        public async Task RevokeAllRefreshTokensAsync(string userId, string? reason = null)
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.IsActive)
                .ToListAsync();
                
            foreach (var token in activeTokens)
            {
                token.IsRevoked = true;
                token.RevokedDate = DateTime.UtcNow;
                token.ReasonRevoked = reason ?? "All tokens revoked";
            }
            
            await _context.SaveChangesAsync();
            _logger.LogInformation("All refresh tokens revoked for user {UserId}: {Count} tokens", userId, activeTokens.Count);
        }
        
        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"] ?? "DefaultSecretKey")),
                ValidateLifetime = false
            };
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            
            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");
                
            return principal;
        }
    }
}