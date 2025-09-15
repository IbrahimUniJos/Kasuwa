# Kasuwa Data Seeder Documentation

## Overview

The Kasuwa Data Seeder is a comprehensive solution for populating your northern Nigerian e-commerce application with realistic sample data using the Bogus library. It generates culturally appropriate data including traditional names, products, and business scenarios specific to northern Nigeria.

## Features

### Generated Data
- **200+ Products** across 9 categories tailored to northern Nigerian culture
- **30 Vendors** with authentic northern Nigerian names and business details
- **50 Customers** with diverse northern Nigerian names
- **150 Orders** with realistic order patterns
- **9 Product Categories** specific to the region

### Cultural Authenticity
- **Names**: Mix of Hausa, Fulani, Kanuri, and Nupe names
- **Products**: Local items like Millet (Gero), Sorghum (Dawa), Traditional Wear (Kaftan, Hijab), Livestock, etc.
- **Locations**: Major northern Nigerian cities (Kano, Kaduna, Sokoto, Maiduguri, etc.)
- **Pricing**: Realistic Nigerian Naira (₦) pricing

## Categories and Sample Products

### 1. Foodstuff & Grains
- Millet (Gero) - ₦3,500
- Sorghum (Dawa) - ₦3,200
- Rice (Shinkafa) - ₦45,000
- Beans (Wake) - ₦4,500
- Groundnuts (Gyada) - ₦3,800

### 2. Livestock & Animals
- Ram (Rago) - ₦180,000
- Goat (Akuya) - ₦85,000
- Cow (Saniya) - ₦450,000
- Chicken (Kaza) - ₦3,500

### 3. Traditional Wear
- Kaftan - ₦25,000
- Agbada - ₦65,000
- Hijab - ₦3,500
- Zanna Cap - ₦8,500
- Fulani Hat - ₦5,500

### 4. Textiles & Fabrics
- Ankara Fabric - ₦2,500
- Atamfa Fabric - ₦8,500
- Adire Fabric - ₦3,500

### 5. Leather Products
- Leather Sandals (Takalmi) - ₦8,500
- Leather Bag - ₦25,000
- Leather Belt - ₦5,500

### 6. Handicrafts & Arts
- Woven Basket - ₦8,500
- Clay Pot - ₦5,500
- Wood Carving - ₦25,000
- Drum (Ganga) - ₦35,000

### 7. Electronics
- Mobile Phone - ₦85,000
- Radio - ₦12,000
- Fan - ₦35,000

### 8. Household Items
- Cooking Pot - ₦8,500
- Plastic Bucket - ₦3,500
- Mosquito Net - ₦6,800

### 9. Spices & Seasonings
- Curry Powder - ₦2,500
- Black Pepper - ₦8,500
- Red Pepper (Barkono) - ₦3,500

## Installation and Usage

### Prerequisites
- .NET 9.0 or later
- Entity Framework Core
- ASP.NET Core Identity
- SQL Server (or your preferred database)

### Setup

1. **Install the Bogus package** (already done):
   ```bash
   dotnet add package Bogus
   ```

2. **Files Created**:
   - `Data/Seeders/DataSeeder.cs` - Main seeder class
   - `Extensions/ServiceExtensions.cs` - Extension methods for easy integration

3. **Integration**: The seeder is automatically integrated into `Program.cs` and runs only in Development environment.

### Running the Seeder

The seeder runs automatically when you start the application in Development mode:

```bash
dotnet run
```

The seeder will:
1. Check if data already exists (prevents duplicate seeding)
2. Create 9 product categories
3. Generate 30 vendors with northern Nigerian business profiles
4. Create 50 customers with diverse northern Nigerian names
5. Generate 200+ products across all categories
6. Create 150 orders with realistic order patterns

### Manual Seeding

You can also run the seeder manually by calling:

```csharp
// In your startup code or controller
using var scope = serviceProvider.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

var seeder = new DataSeeder(context, userManager);
await seeder.SeedAsync();
```

## Configuration

### Customization Options

The seeder uses a fixed seed (12345) for reproducible data. To change this, modify:

```csharp
Randomizer.Seed = new Random(12345); // Change this number
```

### Environment Control

The seeder only runs in Development environment by default. To change this behavior, modify `Program.cs`:

```csharp
// Remove this condition to run in all environments
if (app.Environment.IsDevelopment())
{
    await app.Services.SeedDataAsync();
}
```

## Data Structure

### Vendors
- 30 vendors with authentic northern Nigerian names
- Business names reflecting local commerce
- Addresses in major northern cities
- Approved vendor status for immediate trading

### Customers
- 50 customers with diverse names from multiple ethnicities
- Nigerian phone numbers (+234 format)
- Addresses across northern Nigeria
- Random age distribution (18-60 years)

### Products
- Distributed across all 9 categories
- Realistic pricing in Nigerian Naira
- Proper stock quantities
- SKUs and weight information
- Cultural relevance to northern Nigeria

### Orders
- 150 orders with 1-5 items each
- Realistic order dates (last 6 months)
- Proper shipping and billing addresses
- Various order statuses
- Calculated totals including shipping and tax

## Performance Notes

- Seeding typically takes 10-30 seconds depending on system performance
- Uses efficient bulk insert operations
- Prevents duplicate data creation
- Uses consistent random seeding for reproducible results

## Troubleshooting

### Common Issues

1. **Seeder doesn't run**: Check that you're in Development environment
2. **Data already exists**: The seeder prevents duplicate data - clear your database to re-seed
3. **Identity errors**: Ensure ASP.NET Core Identity is properly configured

### Logging

The seeder includes comprehensive logging. Check your console output for:
- Seeding progress messages
- Error details if seeding fails
- Completion confirmation with statistics

## Extending the Seeder

To add more categories or products:

1. Add new categories to the `SeedCategories()` method
2. Create new product generation methods following the existing pattern
3. Add the new method call to `SeedProducts()`
4. Update the README with new product types

Example:
```csharp
private List<Product> GenerateNewCategoryProducts(ProductCategory category, List<ApplicationUser> vendors)
{
    var items = new[]
    {
        ("Product Name", "Description", minPrice, maxPrice),
        // Add more items...
    };

    return items.Select(item => new Product
    {
        // Configure product properties...
    }).ToList();
}
```

## License

This data seeder is part of the Kasuwa e-commerce platform and follows the same licensing terms as the main project.