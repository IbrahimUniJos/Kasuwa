using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kasuwa.Server.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(2000)]
        public string? Comment { get; set; }

        public bool IsApproved { get; set; } = false;

        public bool IsVerifiedPurchase { get; set; } = false;

        public int HelpfulCount { get; set; } = 0;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? ReviewerName { get; set; } // Display name for the review

        public DateTime? ApprovedDate { get; set; }

        [MaxLength(100)]
        public string? ApprovedBy { get; set; } // Admin who approved

        [MaxLength(500)]
        public string? AdminNotes { get; set; }

        // Navigation properties
        public virtual Product Product { get; set; } = null!;
        public virtual ApplicationUser Customer { get; set; } = null!;
        public virtual ICollection<ReviewHelpful> ReviewHelpfuls { get; set; } = new List<ReviewHelpful>();
    }
}