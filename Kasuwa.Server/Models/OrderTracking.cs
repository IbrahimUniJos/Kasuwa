using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.Models
{
    public class OrderTracking
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public OrderStatus Status { get; set; }

        public DateTime StatusDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; } // UserId who made the update

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
    }
}