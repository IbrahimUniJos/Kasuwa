using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.Models
{
    public class ReviewHelpful
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReviewId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public bool IsHelpful { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Review Review { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
    }
}