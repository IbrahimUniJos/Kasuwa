using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        
        // Product-related entities
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        
        // Order-related entities
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderTracking> OrderTrackings { get; set; }
        
        // Cart and Wishlist entities
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        
        // Payment entities
        public DbSet<Payment> Payments { get; set; }
        
        // Review entities
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewHelpful> ReviewHelpfuls { get; set; }
        
        // Admin entities
        public DbSet<UserSuspension> UserSuspensions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // Configure ApplicationUser
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.BusinessName).HasMaxLength(100);
                entity.Property(e => e.BusinessDescription).HasMaxLength(500);
                entity.Property(e => e.BusinessAddress).HasMaxLength(200);
                entity.Property(e => e.BusinessPhone).HasMaxLength(20);
                entity.Property(e => e.PreferredLanguage).HasMaxLength(10);
                entity.Property(e => e.ProfileImageUrl).HasMaxLength(500);
                
                entity.HasIndex(e => e.UserType);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsVendorApproved);
            });
            
            // Configure UserAddress
            builder.Entity<UserAddress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Addresses)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsDefault);
            });
            
            // Configure RefreshToken
            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.Property(e => e.Token).HasMaxLength(500).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ExpiryDate).IsRequired();
                entity.Property(e => e.CreatedDate).IsRequired();
                entity.Property(e => e.ReplacedByToken).HasMaxLength(500);
                entity.Property(e => e.ReasonRevoked).HasMaxLength(200);
                
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasIndex(e => e.ExpiryDate);
                entity.HasIndex(e => e.IsRevoked);
            });
            
            // Seed roles
            SeedRoles(builder);
            
            // Configure Product entities
            ConfigureProductEntities(builder);
            
            // Configure Order entities
            ConfigureOrderEntities(builder);
            
            // Configure Cart and Wishlist entities
            ConfigureCartAndWishlistEntities(builder);
            
            // Configure Payment entities
            ConfigurePaymentEntities(builder);
            
            // Configure Review entities
            ConfigureReviewEntities(builder);
            
            // Configure Admin entities
            ConfigureAdminEntities(builder);
        }
        
        private void SeedRoles(ModelBuilder builder)
        {
            var customerRole = new IdentityRole
            {
                Id = "1",
                Name = "Customer",
                NormalizedName = "CUSTOMER"
            };
            
            var vendorRole = new IdentityRole
            {
                Id = "2", 
                Name = "Vendor",
                NormalizedName = "VENDOR"
            };
            
            var adminRole = new IdentityRole
            {
                Id = "3",
                Name = "Administrator", 
                NormalizedName = "ADMINISTRATOR"
            };
            
            builder.Entity<IdentityRole>().HasData(customerRole, vendorRole, adminRole);
        }
        
        private void ConfigureProductEntities(ModelBuilder builder)
        {
            // Configure Product
            builder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.SKU).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.ComparePrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Weight).HasColumnType("decimal(5,2)");
                entity.Property(e => e.WeightUnit).HasMaxLength(50);
                entity.Property(e => e.MetaTitle).HasMaxLength(500);
                entity.Property(e => e.MetaDescription).HasMaxLength(1000);
                
                entity.HasOne(e => e.Vendor)
                      .WithMany()
                      .HasForeignKey(e => e.VendorId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.VendorId);
                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.SKU).IsUnique();
                entity.HasIndex(e => e.CreatedDate);
            });
            
            // Configure ProductCategory
            builder.Entity<ProductCategory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.ImageUrl).HasMaxLength(200);
                entity.Property(e => e.Slug).HasMaxLength(100);
                entity.Property(e => e.MetaTitle).HasMaxLength(500);
                entity.Property(e => e.MetaDescription).HasMaxLength(1000);
                
                entity.HasOne(e => e.ParentCategory)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(e => e.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.ParentCategoryId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.Slug).IsUnique();
            });
            
            // Configure ProductImage
            builder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).HasMaxLength(500).IsRequired();
                entity.Property(e => e.AltText).HasMaxLength(200);
                
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Images)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.IsPrimary);
            });
            
            // Configure ProductVariant
            builder.Entity<ProductVariant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Value).HasMaxLength(100).IsRequired();
                entity.Property(e => e.PriceAdjustment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SKU).HasMaxLength(50);
                
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.IsActive);
            });
        }
        
        private void ConfigureOrderEntities(ModelBuilder builder)
        {
            // Configure Order
            builder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderNumber).HasMaxLength(50).IsRequired();
                entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ShippingCost).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
                entity.Property(e => e.BillingAddress).HasMaxLength(500);
                entity.Property(e => e.TrackingNumber).HasMaxLength(100);
                entity.Property(e => e.ShippingMethod).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.Property(e => e.CancellationReason).HasMaxLength(1000);
                
                entity.HasOne(e => e.Customer)
                      .WithMany()
                      .HasForeignKey(e => e.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.OrderDate);
            });
            
            // Configure OrderItem
            builder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ProductName).HasMaxLength(200);
                entity.Property(e => e.ProductSKU).HasMaxLength(50);
                entity.Property(e => e.ProductVariant).HasMaxLength(200);
                entity.Property(e => e.ProductImageUrl).HasMaxLength(500);
                
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.OrderItems)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.OrderItems)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.Vendor)
                      .WithMany()
                      .HasForeignKey(e => e.VendorId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.VendorId);
            });
            
            // Configure OrderTracking
            builder.Entity<OrderTracking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.TrackingNumber).HasMaxLength(100);
                entity.Property(e => e.Location).HasMaxLength(100);
                entity.Property(e => e.UpdatedBy).HasMaxLength(100);
                
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.OrderTrackings)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.StatusDate);
            });
        }
        
        private void ConfigureCartAndWishlistEntities(ModelBuilder builder)
        {
            // Configure Cart
            builder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.UserId).IsUnique();
            });
            
            // Configure CartItem
            builder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.CartItems)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.ProductVariant)
                      .WithMany()
                      .HasForeignKey(e => e.ProductVariantId)
                      .OnDelete(DeleteBehavior.SetNull);
                      
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => new { e.UserId, e.ProductId, e.ProductVariantId }).IsUnique();
            });
            
            // Configure Wishlist
            builder.Entity<Wishlist>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.UserId).IsUnique();
            });
            
            // Configure WishlistItem
            builder.Entity<WishlistItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.WishlistItems)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => new { e.UserId, e.ProductId }).IsUnique();
            });
        }
        
        private void ConfigurePaymentEntities(ModelBuilder builder)
        {
            // Configure Payment
            builder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PaymentMethod).HasMaxLength(100).IsRequired();
                entity.Property(e => e.PaymentProvider).HasMaxLength(200).IsRequired();
                entity.Property(e => e.TransactionId).HasMaxLength(100).IsRequired();
                entity.Property(e => e.ExternalTransactionId).HasMaxLength(200);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Currency).HasMaxLength(3).IsRequired();
                entity.Property(e => e.FailureReason).HasMaxLength(500);
                entity.Property(e => e.PaymentResponse).HasMaxLength(1000);
                entity.Property(e => e.RefundAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RefundReason).HasMaxLength(500);
                entity.Property(e => e.RefundTransactionId).HasMaxLength(100);
                
                entity.HasOne(e => e.Order)
                      .WithOne(o => o.Payment)
                      .HasForeignKey<Payment>(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.OrderId).IsUnique();
                entity.HasIndex(e => e.TransactionId).IsUnique();
                entity.HasIndex(e => e.ExternalTransactionId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.PaymentDate);
            });
        }
        
        private void ConfigureReviewEntities(ModelBuilder builder)
        {
            // Configure Review
            builder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(100);
                entity.Property(e => e.Comment).HasMaxLength(2000);
                entity.Property(e => e.ReviewerName).HasMaxLength(100);
                entity.Property(e => e.ApprovedBy).HasMaxLength(100);
                entity.Property(e => e.AdminNotes).HasMaxLength(500);
                
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Customer)
                      .WithMany()
                      .HasForeignKey(e => e.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.IsApproved);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.CreatedDate);
            });
            
            // Configure ReviewHelpful
            builder.Entity<ReviewHelpful>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Review)
                      .WithMany(r => r.ReviewHelpfuls)
                      .HasForeignKey(e => e.ReviewId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.ReviewId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.ReviewId, e.UserId }).IsUnique();
            });
        }
        
        private void ConfigureAdminEntities(ModelBuilder builder)
        {
            // Configure UserSuspension
            builder.Entity<UserSuspension>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.SuspendedBy)
                      .WithMany()
                      .HasForeignKey(e => e.SuspendedById)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SuspendedById);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.SuspendedAt);
                entity.HasIndex(e => e.IsActive);
            });
            
            // Configure AuditLog
            builder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.AdminUser)
                      .WithMany()
                      .HasForeignKey(e => e.AdminUserId)
                      .OnDelete(DeleteBehavior.SetNull);
                      
                entity.HasIndex(e => e.AdminUserId);
                entity.HasIndex(e => e.Action);
                entity.HasIndex(e => e.EntityType);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Level);
            });
        }
    }
}