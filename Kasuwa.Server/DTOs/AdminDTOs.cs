using Kasuwa.Server.Models;

namespace Kasuwa.Server.DTOs
{
    // User Management DTOs
    public class UserFilterDto
    {
        public string? SearchTerm { get; set; }
        public UserType? UserType { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; } = "DateCreated";
        public SortDirection SortDirection { get; set; } = SortDirection.Desc;
    }

    public class ApprovalDto
    {
        public string? ApprovalNotes { get; set; }
        public decimal? CommissionRate { get; set; }
        public List<string>? SpecialPermissions { get; set; }
    }

    public class SuspensionDto
    {
        public string Reason { get; set; } = string.Empty;
        public SuspensionType SuspensionType { get; set; }
        public string? Duration { get; set; }
        public bool NotifyUser { get; set; } = true;
        public bool FreezeOrders { get; set; } = true;
        public string? AdminNotes { get; set; }
    }

    public class UserActivityDto
    {
        public int UserId { get; set; }
        public DateTime ActivityDate { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    // Product Moderation DTOs
    public class ModerationFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public string? VendorId { get; set; }
        public DateTime? SubmittedFrom { get; set; }
        public DateTime? SubmittedTo { get; set; }
        public decimal? PriceFrom { get; set; }
        public decimal? PriceTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class RejectionDto
    {
        public string Reason { get; set; } = string.Empty;
        public List<string>? FlaggedIssues { get; set; }
    }

    public class BulkModerationDto
    {
        public List<int> ProductIds { get; set; } = new List<int>();
        public string Action { get; set; } = string.Empty; // "Approve", "Reject", "CategoryChange", "PriceReview"
        public string? Notes { get; set; }
        public bool ApplyToAll { get; set; } = false;
    }

    // Order Management DTOs
    public class DisputeFilterDto
    {
        public string? SearchTerm { get; set; }
        public DisputeStatus? Status { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class DisputeResolutionDto
    {
        public DisputeResolution Resolution { get; set; }
        public decimal RefundAmount { get; set; }
        public string? AdminNotes { get; set; }
        public bool NotifyParties { get; set; } = true;
        public bool VendorPenalty { get; set; } = false;
    }

    // Analytics and Reporting DTOs
    public class SalesReportParametersDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Granularity { get; set; } = "Daily"; // Daily, Weekly, Monthly
        public string? VendorId { get; set; }
        public int? CategoryId { get; set; }
        public string Format { get; set; } = "Json"; // Json, Csv, Excel
    }

    public class SalesReportDto
    {
        public DateRangeDto ReportPeriod { get; set; } = new DateRangeDto();
        public SalesSummaryDto Summary { get; set; } = new SalesSummaryDto();
        public List<SalesByPeriodDto> SalesByPeriod { get; set; } = new List<SalesByPeriodDto>();
        public List<TopVendorDto> TopVendors { get; set; } = new List<TopVendorDto>();
    }

    public class DateRangeDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class SalesSummaryDto
    {
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal TotalCommission { get; set; }
    }

    public class SalesByPeriodDto
    {
        public DateTime Date { get; set; }
        public decimal Sales { get; set; }
        public int Orders { get; set; }
        public decimal Commission { get; set; }
    }

    public class TopVendorDto
    {
        public string VendorId { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public decimal Sales { get; set; }
        public int Orders { get; set; }
        public decimal Commission { get; set; }
    }

    public class UserActivityReportDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewRegistrations { get; set; }
        public Dictionary<string, int> UsersByRole { get; set; } = new Dictionary<string, int>();
        public UserActivityMetricsDto UserActivity { get; set; } = new UserActivityMetricsDto();
    }

    public class UserActivityMetricsDto
    {
        public int DailyActiveUsers { get; set; }
        public int WeeklyActiveUsers { get; set; }
        public int MonthlyActiveUsers { get; set; }
    }

    // Platform Configuration DTOs
    public class PlatformSettingsDto
    {
        public GeneralSettingsDto General { get; set; } = new GeneralSettingsDto();
        public ModerationSettingsDto Moderation { get; set; } = new ModerationSettingsDto();
        public PaymentSettingsDto Payments { get; set; } = new PaymentSettingsDto();
    }

    public class GeneralSettingsDto
    {
        public string PlatformName { get; set; } = "Kasuwa Marketplace";
        public decimal DefaultCommissionRate { get; set; } = 5.0m;
        public decimal MinimumOrderAmount { get; set; } = 10.00m;
        public decimal TaxRate { get; set; } = 8.5m;
    }

    public class ModerationSettingsDto
    {
        public bool AutoApproveProducts { get; set; } = false;
        public bool RequireVendorVerification { get; set; } = true;
        public bool ReviewModerationEnabled { get; set; } = true;
    }

    public class PaymentSettingsDto
    {
        public List<string> SupportedPaymentMethods { get; set; } = new List<string> { "CreditCard", "PayPal", "BankTransfer" };
        public decimal PaymentProcessingFee { get; set; } = 2.9m;
        public string VendorPayoutSchedule { get; set; } = "Weekly";
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

    // Audit Log DTOs
    public class AuditLogDto
    {
        public int Id { get; set; }
        public string? AdminUserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public DateTime CreatedAt { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public AuditLogLevel Level { get; set; }
        public string? AdditionalData { get; set; }
    }

    // Enums for administrative operations
    public enum SortDirection
    {
        Asc,
        Desc
    }

    public enum SuspensionType
    {
        Warning = 1,
        Temporary = 2,
        Permanent = 3
    }

    public enum DisputeResolution
    {
        RefundCustomer = 1,
        RefundPartial = 2,
        RejectDispute = 3,
        VendorPenalty = 4
    }

    public enum DisputeStatus
    {
        Open = 1,
        UnderReview = 2,
        Resolved = 3,
        Closed = 4,
        Escalated = 5
    }

    public enum AuditLogLevel
    {
        Info = 1,
        Warning = 2,
        Error = 3,
        Critical = 4
    }
}