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
            
            // Seed roles
            SeedRoles(builder);
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
    }
}