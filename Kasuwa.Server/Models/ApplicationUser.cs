using Microsoft.AspNetCore.Identity;

namespace Kasuwa.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; } = true;
        
        // User type properties
        public UserType UserType { get; set; } = UserType.Customer;
        
        // Vendor-specific properties
        public string? BusinessName { get; set; }
        public string? BusinessDescription { get; set; }
        public string? BusinessAddress { get; set; }
        public string? BusinessPhone { get; set; }
        public DateTime? VendorApprovedDate { get; set; }
        public bool IsVendorApproved { get; set; } = false;
        
        // Customer-specific properties
        public DateTime? DateOfBirth { get; set; }
        public string? PreferredLanguage { get; set; }
        
        // Profile image
        public string? ProfileImageUrl { get; set; }
        
        // Address information
        public virtual ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>();
    }
    
    public enum UserType
    {
        Customer = 1,
        Vendor = 2,
        Administrator = 3
    }
}