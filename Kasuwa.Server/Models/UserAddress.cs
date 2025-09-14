using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.Models
{
    public class UserAddress
    {
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string AddressLine1 { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? AddressLine2 { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string City { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string State { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(10)]
        public string PostalCode { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Country { get; set; } = string.Empty;
        
        public bool IsDefault { get; set; } = false;
        
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ApplicationUser User { get; set; } = null!;
    }
}