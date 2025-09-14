using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.Models
{
    /// <summary>
    /// Represents a refresh token for JWT authentication
    /// </summary>
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        public DateTime ExpiryDate { get; set; }
        
        public bool IsRevoked { get; set; } = false;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? RevokedDate { get; set; }
        
        public string? ReplacedByToken { get; set; }
        
        public string? ReasonRevoked { get; set; }
        
        // Navigation property
        public virtual ApplicationUser User { get; set; } = null!;
        
        // Helper properties
        public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
        
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}