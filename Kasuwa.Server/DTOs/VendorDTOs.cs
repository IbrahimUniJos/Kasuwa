using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.DTOs
{
    // Vendor Management DTOs
    public class VendorApplicationStatusDto
    {
        public bool IsApproved { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string ApplicationStatus { get; set; } = string.Empty;
        public string? BusinessName { get; set; }
        public string? BusinessDescription { get; set; }
    }

    public class VendorDashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int TotalCustomers { get; set; }
        public double AverageRating { get; set; }
    }

    public class UpdateVendorBusinessProfileDto
    {
        [Required(ErrorMessage = "Business name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Business name must be between 2 and 100 characters")]
        public string BusinessName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Business description is required")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Business description must be between 10 and 500 characters")]
        public string BusinessDescription { get; set; } = string.Empty;
        
        [StringLength(200, ErrorMessage = "Business address cannot exceed 200 characters")]
        public string? BusinessAddress { get; set; }
        
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string? BusinessPhone { get; set; }
    }

    // Admin Dashboard DTOs
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalVendors { get; set; }
        public int ApprovedVendors { get; set; }
        public int PendingVendorApplications { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }
        public decimal TotalPlatformRevenue { get; set; }
        public decimal MonthlyPlatformRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
    }

    public class VendorApplicationDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? BusinessName { get; set; }
        public string? BusinessDescription { get; set; }
        public string? BusinessAddress { get; set; }
        public string? BusinessPhone { get; set; }
        public DateTime DateCreated { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovedDate { get; set; }
    }

    // Enhanced validation DTOs
    public class EnhancedRegisterRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Confirm password is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "First name can only contain letters and spaces")]
        public string FirstName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Last name can only contain letters and spaces")]
        public string LastName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "User type is required")]
        [EnumDataType(typeof(UserType), ErrorMessage = "Invalid user type")]
        public UserType UserType { get; set; }
        
        // Vendor-specific validation
        [StringLength(100, ErrorMessage = "Business name cannot exceed 100 characters")]
        public string? BusinessName { get; set; }
        
        [StringLength(500, ErrorMessage = "Business description cannot exceed 500 characters")]
        public string? BusinessDescription { get; set; }
        
        [StringLength(200, ErrorMessage = "Business address cannot exceed 200 characters")]
        public string? BusinessAddress { get; set; }
        
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string? BusinessPhone { get; set; }
        
        // Customer-specific fields
        public DateTime? DateOfBirth { get; set; }
        
        [StringLength(10, ErrorMessage = "Preferred language cannot exceed 10 characters")]
        public string? PreferredLanguage { get; set; }
    }
}