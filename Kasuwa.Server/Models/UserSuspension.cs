using System.ComponentModel.DataAnnotations.Schema;

namespace Kasuwa.Server.Models
{
    public class UserSuspension
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string SuspendedById { get; set; } = string.Empty;
        public SuspensionType Type { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime SuspendedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public bool FreezeOrders { get; set; }
        public string? AdminNotes { get; set; }
        
        // Navigation Properties
        public virtual ApplicationUser? User { get; set; }
        public virtual ApplicationUser? SuspendedBy { get; set; }
    }

    public enum SuspensionType
    {
        Warning = 1,
        Temporary = 2,
        Permanent = 3
    }
}