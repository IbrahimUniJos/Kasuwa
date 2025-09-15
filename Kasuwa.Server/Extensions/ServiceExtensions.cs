using Kasuwa.Server.Data;
using Kasuwa.Server.Data.Seeders;
using Kasuwa.Server.Models;
using Microsoft.AspNetCore.Identity;

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
    }
}