using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.DTOs
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public UserType UserType { get; set; }
        
        // Vendor-specific fields (optional)
        [StringLength(100)]
        public string? BusinessName { get; set; }
        
        [StringLength(500)]
        public string? BusinessDescription { get; set; }
        
        [StringLength(200)]
        public string? BusinessAddress { get; set; }
        
        [Phone]
        public string? BusinessPhone { get; set; }
        
        // Customer-specific fields (optional)
        public DateTime? DateOfBirth { get; set; }
        
        [StringLength(10)]
        public string? PreferredLanguage { get; set; }
    }
    
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        public bool RememberMe { get; set; } = false;
    }
    
    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? TokenExpiration { get; set; }
        public UserDto? User { get; set; }
    }
    
    public class RefreshTokenRequestDto
    {
        [Required]
        public string AccessToken { get; set; } = string.Empty;
        
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
    
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public UserType UserType { get; set; }
        public bool IsActive { get; set; }
        public bool IsVendorApproved { get; set; }
        public string? BusinessName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? LastLogin { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
    
    public class ChangePasswordRequestDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; } = string.Empty;
        
        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
    
    public class ForgotPasswordRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
    
    public class ResetPasswordRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}