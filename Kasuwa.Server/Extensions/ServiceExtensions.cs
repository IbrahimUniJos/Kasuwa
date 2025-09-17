using Kasuwa.Server.Data;
using Kasuwa.Server.Data.Seeders;
using Kasuwa.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Extensions
{
    public static class ServiceExtensions
    {
        public static async Task<IServiceProvider> SeedDataAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<DataSeeder>>();

            try
            {
                logger.LogInformation("Starting data seeding process...");
                
                var seeder = new DataSeeder(context, userManager);
                await seeder.SeedAsync();
                
                logger.LogInformation("Data seeding completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding data: {Message}", ex.Message);
                throw;
            }

            return serviceProvider;
        }

        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Business Logic Services
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IWishlistService, WishlistService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IUserAddressService, UserAddressService>();
            
            // Authentication Services
            services.AddScoped<ITokenService, TokenService>();
            
            return services;
        }

        public static IServiceCollection AddIdentityConfiguration(this IServiceCollection services)
        {
            services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 6;
                
                // User settings
                options.User.RequireUniqueEmail = true;
                
                // Sign-in settings
                options.SignIn.RequireConfirmedEmail = false; // Set to true in production
                options.SignIn.RequireConfirmedAccount = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            return services;
        }

        public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireCustomerRole", policy =>
                    policy.RequireRole("Customer"));
                
                options.AddPolicy("RequireVendorRole", policy =>
                    policy.RequireRole("Vendor"));
                
                options.AddPolicy("RequireAdminRole", policy =>
                    policy.RequireRole("Administrator"));
                
                options.AddPolicy("RequireVendorOrAdmin", policy =>
                    policy.RequireRole("Vendor", "Administrator"));
                
                options.AddPolicy("RequireCustomerOrVendor", policy =>
                    policy.RequireRole("Customer", "Vendor"));
            });

            return services;
        }
    }
}