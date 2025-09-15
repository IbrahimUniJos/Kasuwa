namespace Kasuwa.Server.Models
{
    public class AuditLog
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
        
        // Navigation Properties
        public virtual ApplicationUser? AdminUser { get; set; }
    }

    public enum AuditLogLevel
    {
        Info = 1,
        Warning = 2,
        Error = 3,
        Critical = 4
    }
}