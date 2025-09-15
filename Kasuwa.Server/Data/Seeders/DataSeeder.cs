using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Data.Seeders
{
    public class DataSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DataSeeder(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task SeedAsync()
        {
            // Check if data already exists
            if (await _context.ProductCategories.AnyAsync() || 
                await _context.Products.AnyAsync() || 
                await _context.Users.Where(u => u.UserType != UserType.Administrator).AnyAsync())
            {
                return; // Data already seeded
            }

            // Configure Bogus to use consistent seed for reproducible data
            Randomizer.Seed = new Random(12345);

            // Seed categories first
            var categories = await SeedCategories();
            
            // Seed vendors
            var vendors = await SeedVendors();
            
            // Seed customers  
            var customers = await SeedCustomers();
            
            // Seed products
            var products = await SeedProducts(categories, vendors);
            
            // Seed orders
            await SeedOrders(customers, products, vendors);

            await _context.SaveChangesAsync();
        }

        private async Task<List<ProductCategory>> SeedCategories()
        {
            var categories = new List<ProductCategory>
            {
                new ProductCategory
                {
                    Name = "Foodstuff & Grains",
                    Description = "Essential food items and grains for daily consumption",
                    Slug = "foodstuff-grains",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-30)
                },
                new ProductCategory
                {
                    Name = "Livestock & Animals",
                    Description = "Live animals for farming and consumption",
                    Slug = "livestock-animals",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-25)
                },
                new ProductCategory
                {
                    Name = "Textiles & Fabrics",
                    Description = "Traditional and modern fabrics and textiles",
                    Slug = "textiles-fabrics",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-20)
                },
                new ProductCategory
                {
                    Name = "Traditional Wear",
                    Description = "Traditional northern Nigerian clothing and accessories",
                    Slug = "traditional-wear",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-18)
                },
                new ProductCategory
                {
                    Name = "Leather Products",
                    Description = "Handcrafted leather goods and accessories",
                    Slug = "leather-products",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-15)
                },
                new ProductCategory
                {
                    Name = "Handicrafts & Arts",
                    Description = "Traditional handicrafts and artistic items",
                    Slug = "handicrafts-arts",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-12)
                },
                new ProductCategory
                {
                    Name = "Electronics",
                    Description = "Modern electronic devices and gadgets",
                    Slug = "electronics",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-10)
                },
                new ProductCategory
                {
                    Name = "Household Items",
                    Description = "Essential items for the home",
                    Slug = "household-items",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-8)
                },
                new ProductCategory
                {
                    Name = "Spices & Seasonings",
                    Description = "Local and imported spices and seasonings",
                    Slug = "spices-seasonings",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-5)
                }
            };

            await _context.ProductCategories.AddRangeAsync(categories);
            await _context.SaveChangesAsync();
            return categories;
        }

        private async Task<List<ApplicationUser>> SeedVendors()
        {
            // Northern Nigerian vendor names (mix of Hausa, Fulani, Kanuri, and Nupe names)
            var vendorNames = new[]
            {
                ("Aliyu", "Abdullahi"), ("Fatima", "Usman"), ("Ibrahim", "Mohammed"),
                ("Aisha", "Hassan"), ("Musa", "Bello"), ("Khadija", "Suleiman"),
                ("Umar", "Ahmad"), ("Zainab", "Yusuf"), ("Sani", "Garba"),
                ("Hauwa", "Tijani"), ("Bashir", "Lawal"), ("Maryam", "Dikko"),
                ("Haruna", "Yakubu"), ("Safiya", "Adamu"), ("Nasir", "Magaji"),
                ("Amina", "Shehu"), ("Salisu", "Danjuma"), ("Balkisu", "Isa"),
                ("Yakubu", "Audu"), ("Hadiza", "Musa"), ("Abdullahi", "Baba"),
                ("Rabi", "Sani"), ("Mahmud", "Yaro"), ("Halima", "Shehu"),
                ("Ismail", "Rabiu"), ("Jummai", "Aliyu"), ("Kabir", "Tanko"),
                ("Asma'u", "Hashim"), ("Suleiman", "Babangida"), ("Umma", "Balarabe")
            };

            var businessNames = new[]
            {
                "Kano Grains & Commodities", "Sokoto Livestock Market", "Kaduna Textile Hub",
                "Maiduguri Traditional Crafts", "Bauchi Electronics Center", "Yola Leather Works",
                "Katsina Spice House", "Zaria Fashion Boutique", "Gombe Household Essentials",
                "Dutse Agricultural Supplies", "Birnin Kebbi Trade Center", "Jalingo Craft Gallery",
                "Gashua Provisions Store", "Potiskum Fashion House", "Azare Electronics Mart",
                "Bida Traditional Wear", "Kontagora Leather Goods", "Lafia Grains Market",
                "Minna Electronics Plaza", "Suleja Textile Mills"
            };

            var northernCities = new[]
            {
                "Kano, Kano State", "Kaduna, Kaduna State", "Sokoto, Sokoto State",
                "Maiduguri, Borno State", "Bauchi, Bauchi State", "Katsina, Katsina State",
                "Yola, Adamawa State", "Zaria, Kaduna State", "Gombe, Gombe State",
                "Dutse, Jigawa State", "Birnin Kebbi, Kebbi State", "Jalingo, Taraba State",
                "Gashua, Yobe State", "Potiskum, Yobe State", "Azare, Bauchi State",
                "Bida, Niger State", "Kontagora, Niger State", "Lafia, Nasarawa State",
                "Minna, Niger State", "Suleja, Niger State"
            };

            var vendorFaker = new Faker<ApplicationUser>()
                .RuleFor(u => u.Id, f => Guid.NewGuid().ToString())
                .RuleFor(u => u.UserName, f => f.Internet.UserName())
                .RuleFor(u => u.Email, f => f.Internet.Email())
                .RuleFor(u => u.EmailConfirmed, true)
                .RuleFor(u => u.PhoneNumber, f => GenerateNigerianPhoneNumber(f))
                .RuleFor(u => u.PhoneNumberConfirmed, true)
                .RuleFor(u => u.UserType, UserType.Vendor)
                .RuleFor(u => u.IsVendorApproved, true)
                .RuleFor(u => u.VendorApprovedDate, f => f.Date.Between(DateTime.UtcNow.AddMonths(-6), DateTime.UtcNow.AddDays(-1)))
                .RuleFor(u => u.DateCreated, f => f.Date.Between(DateTime.UtcNow.AddMonths(-8), DateTime.UtcNow.AddDays(-30)))
                .RuleFor(u => u.IsActive, true)
                .RuleFor(u => u.BusinessPhone, f => GenerateNigerianPhoneNumber(f))
                .RuleFor(u => u.PreferredLanguage, f => f.PickRandom("en", "ha", "ff", "kr"));

            var vendors = new List<ApplicationUser>();

            for (int i = 0; i < 30; i++)
            {
                var nameData = vendorNames[i % vendorNames.Length];
                var vendor = vendorFaker.Generate();
                
                vendor.FirstName = nameData.Item1;
                vendor.LastName = nameData.Item2;
                vendor.BusinessName = businessNames[i % businessNames.Length];
                vendor.BusinessAddress = northernCities[i % northernCities.Length];
                vendor.BusinessDescription = GenerateBusinessDescription(vendor.BusinessName);

                vendors.Add(vendor);
            }

            foreach (var vendor in vendors)
            {
                await _userManager.CreateAsync(vendor, "Vendor123!");
                await _userManager.AddToRoleAsync(vendor, "Vendor");
            }

            return vendors;
        }

        private async Task<List<ApplicationUser>> SeedCustomers()
        {
            var customerNames = new[]
            {
                ("Aminu", "Kano"), ("Bilkisu", "Usman"), ("Chidi", "Okeke"), ("Dije", "Bello"),
                ("Emeka", "Nwankwo"), ("Fatou", "Diallo"), ("Grace", "Adebayo"), ("Habib", "Yahaya"),
                ("Ifeoma", "Okafor"), ("Jibril", "Sani"), ("Kemi", "Ogundimu"), ("Lawal", "Garba"),
                ("Mercy", "Titus"), ("Nura", "Abdullahi"), ("Olumide", "Adeyemi"), ("Patience", "Ogbonna"),
                ("Qasim", "Isa"), ("Rahma", "Tijani"), ("Samuel", "Yakubu"), ("Tunde", "Adesina"),
                ("Uche", "Nnaji"), ("Vera", "Ekpo"), ("Wale", "Adebisi"), ("Xenia", "Okoye"),
                ("Yusuf", "Musa"), ("Zara", "Ahmed"), ("Adamu", "Suleiman"), ("Blessing", "Okafor"),
                ("Chiamaka", "Nwachukwu"), ("Dahiru", "Baba"), ("Ebere", "Uzoma"), ("Farida", "Hassan"),
                ("Godwin", "Chukwu"), ("Hafsat", "Yaro"), ("Ibrahim", "Nuhu"), ("Josephine", "Eze"),
                ("Kabiru", "Danmusa"), ("Lami", "Abubakar"), ("Mohammed", "Yakasai"), ("Ngozi", "Anyanwu"),
                ("Obinna", "Okereke"), ("Priscilla", "Udoh"), ("Qadri", "Adegbola"), ("Ruth", "Samuel"),
                ("Suleiman", "Adamu"), ("Titi", "Babatunde"), ("Udoka", "Ibekwe"), ("Victoria", "Bassey"),
                ("Wasiu", "Odunsi"), ("Yemisi", "Akinola"), ("Zainab", "Shuaib"), ("Auwal", "Babangida")
            };

            var customerFaker = new Faker<ApplicationUser>()
                .RuleFor(u => u.Id, f => Guid.NewGuid().ToString())
                .RuleFor(u => u.UserName, f => f.Internet.UserName())
                .RuleFor(u => u.Email, f => f.Internet.Email())
                .RuleFor(u => u.EmailConfirmed, true)
                .RuleFor(u => u.PhoneNumber, f => GenerateNigerianPhoneNumber(f))
                .RuleFor(u => u.PhoneNumberConfirmed, true)
                .RuleFor(u => u.UserType, UserType.Customer)
                .RuleFor(u => u.DateCreated, f => f.Date.Between(DateTime.UtcNow.AddMonths(-12), DateTime.UtcNow.AddDays(-1)))
                .RuleFor(u => u.IsActive, true)
                .RuleFor(u => u.DateOfBirth, f => f.Date.Between(DateTime.Now.AddYears(-60), DateTime.Now.AddYears(-18)))
                .RuleFor(u => u.PreferredLanguage, f => f.PickRandom("en", "ha", "ig", "yo", "ff"));

            var customers = new List<ApplicationUser>();

            for (int i = 0; i < 50; i++)
            {
                var nameData = customerNames[i % customerNames.Length];
                var customer = customerFaker.Generate();
                
                customer.FirstName = nameData.Item1;
                customer.LastName = nameData.Item2;

                customers.Add(customer);
            }

            foreach (var customer in customers)
            {
                await _userManager.CreateAsync(customer, "Customer123!");
                await _userManager.AddToRoleAsync(customer, "Customer");
            }

            return customers;
        }

        private async Task<List<Product>> SeedProducts(List<ProductCategory> categories, List<ApplicationUser> vendors)
        {
            var products = new List<Product>();

            // Foodstuff & Grains products
            var foodProducts = GenerateFoodProducts(categories.First(c => c.Name == "Foodstuff & Grains"), vendors);
            products.AddRange(foodProducts);

            // Livestock products
            var livestockProducts = GenerateLivestockProducts(categories.First(c => c.Name == "Livestock & Animals"), vendors);
            products.AddRange(livestockProducts);

            // Textile products
            var textileProducts = GenerateTextileProducts(categories.First(c => c.Name == "Textiles & Fabrics"), vendors);
            products.AddRange(textileProducts);

            // Traditional wear products
            var traditionalWearProducts = GenerateTraditionalWearProducts(categories.First(c => c.Name == "Traditional Wear"), vendors);
            products.AddRange(traditionalWearProducts);

            // Leather products
            var leatherProducts = GenerateLeatherProducts(categories.First(c => c.Name == "Leather Products"), vendors);
            products.AddRange(leatherProducts);

            // Handicrafts products
            var handicraftProducts = GenerateHandicraftProducts(categories.First(c => c.Name == "Handicrafts & Arts"), vendors);
            products.AddRange(handicraftProducts);

            // Electronics products
            var electronicsProducts = GenerateElectronicsProducts(categories.First(c => c.Name == "Electronics"), vendors);
            products.AddRange(electronicsProducts);

            // Household products
            var householdProducts = GenerateHouseholdProducts(categories.First(c => c.Name == "Household Items"), vendors);
            products.AddRange(householdProducts);

            // Spices products
            var spiceProducts = GenerateSpiceProducts(categories.First(c => c.Name == "Spices & Seasonings"), vendors);
            products.AddRange(spiceProducts);

            await _context.Products.AddRangeAsync(products);
            await _context.SaveChangesAsync();

            return products;
        }

        private async Task SeedOrders(List<ApplicationUser> customers, List<Product> products, List<ApplicationUser> vendors)
        {
            var orderFaker = new Faker<Order>()
                .RuleFor(o => o.OrderNumber, f => $"ORD{f.Random.Number(100000, 999999)}")
                .RuleFor(o => o.OrderDate, f => f.Date.Between(DateTime.UtcNow.AddMonths(-6), DateTime.UtcNow))
                .RuleFor(o => o.Status, f => f.PickRandom<OrderStatus>())
                .RuleFor(o => o.ShippingCost, f => f.Random.Decimal(500, 5000))
                .RuleFor(o => o.TaxAmount, f => f.Random.Decimal(100, 1000))
                .RuleFor(o => o.DiscountAmount, f => f.Random.Decimal(0, 2000))
                .RuleFor(o => o.ShippingAddress, f => GenerateNigerianAddress(f))
                .RuleFor(o => o.BillingAddress, f => GenerateNigerianAddress(f))
                .RuleFor(o => o.ShippingMethod, f => f.PickRandom("Express Delivery", "Standard Shipping", "Economy Shipping", "Same Day Delivery"))
                .RuleFor(o => o.EstimatedDeliveryDate, (f, o) => o.OrderDate.AddDays(f.Random.Number(1, 7)))
                .RuleFor(o => o.UpdatedDate, (f, o) => o.OrderDate.AddHours(f.Random.Number(1, 48)));

            var orders = new List<Order>();

            for (int i = 0; i < 150; i++)
            {
                var order = orderFaker.Generate();
                order.CustomerId = customers[i % customers.Count].Id;

                // Generate order items
                var orderItems = new List<OrderItem>();
                var numItems = new Random().Next(1, 6); // 1-5 items per order
                var orderSubTotal = 0m;

                for (int j = 0; j < numItems; j++)
                {
                    var product = products[new Random().Next(0, products.Count)];
                    var quantity = new Random().Next(1, 4);
                    var unitPrice = product.Price;
                    var totalPrice = unitPrice * quantity;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        VendorId = product.VendorId,
                        Quantity = quantity,
                        UnitPrice = unitPrice,
                        TotalPrice = totalPrice,
                        ProductName = product.Name,
                        ProductSKU = product.SKU,
                        ProductImageUrl = $"/images/products/{product.SKU.ToLower()}.jpg"
                    });

                    orderSubTotal += totalPrice;
                }

                order.SubTotal = orderSubTotal;
                order.TotalAmount = orderSubTotal + order.ShippingCost + order.TaxAmount - order.DiscountAmount;
                order.OrderItems = orderItems;

                // Set delivery date if order is delivered
                if (order.Status == OrderStatus.Delivered)
                {
                    order.ActualDeliveryDate = order.OrderDate.AddDays(new Random().Next(1, 14));
                }

                orders.Add(order);
            }

            await _context.Orders.AddRangeAsync(orders);
            await _context.SaveChangesAsync();
        }

        // Helper methods for generating specific product types
        private List<Product> GenerateFoodProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var foodItems = new[]
            {
                ("Millet (Gero)", "Premium quality millet from Kano farms", 3500, 8500),
                ("Sorghum (Dawa)", "Organic sorghum grains, locally sourced", 3200, 7800),
                ("Rice (Shinkafa)", "Kebbi State premium rice", 45000, 85000),
                ("Maize (Masara)", "Fresh yellow corn from Kaduna", 2800, 6500),
                ("Beans (Wake)", "Protein-rich black-eyed beans", 4500, 9200),
                ("Groundnuts (Gyada)", "Roasted groundnuts from Kano", 3800, 7500),
                ("Palm Oil (Mai Kwakwa)", "Pure palm oil from the south", 12000, 18000),
                ("Groundnut Oil (Mai Gyada)", "Cold-pressed groundnut oil", 8500, 15000),
                ("Dried Fish (Busasshen Kifi)", "Sun-dried catfish from Lake Chad", 15000, 25000),
                ("Locust Beans (Daddawa)", "Traditional seasoning cubes", 2500, 4500),
                ("Tiger Nuts (Aya)", "Sweet tiger nuts from Plateau", 5500, 9800),
                ("Dates (Dabino)", "Fresh dates from Borno", 8000, 14000),
                ("Sesame Seeds (Ridi)", "Organic sesame from Gombe", 6200, 11500),
                ("Honey (Zuma)", "Pure forest honey from Taraba", 18000, 28000),
                ("Cowpeas (Alkama)", "Dried cowpeas for soup", 4200, 8100),
                ("Cassava Flour (Gurasa)", "Processed cassava flour", 3500, 6800),
                ("Yam Flour (Amala)", "Traditional yam flour", 4800, 9200),
                ("Plantain Flour", "Ground plantain flour", 5200, 9800),
                ("Ginger (Citta)", "Fresh ginger root from Kaduna", 12000, 18500),
                ("Turmeric (Gangamau)", "Dried turmeric powder", 8500, 13500),
                ("Hibiscus Leaves (Zobo)", "Dried hibiscus for tea", 4500, 7200),
                ("Baobab Leaves (Kuka)", "Dried baobab powder", 6800, 11000),
                ("Moringa Leaves", "Dried moringa powder", 8200, 14500),
                ("Shea Butter (Man Kadanya)", "Pure unrefined shea butter", 15000, 22000),
                ("Dried Meat (Kilishi)", "Spiced dried beef strips", 25000, 35000)
            };

            return foodItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(50, 500),
                SKU = $"FOOD_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 50),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateLivestockProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var livestockItems = new[]
            {
                ("Ram (Rago)", "Healthy adult ram for celebration", 180000, 250000),
                ("Goat (Akuya)", "Young goat, good for meat", 85000, 120000),
                ("Cow (Saniya)", "Zebu cattle, good for farming", 450000, 680000),
                ("Bull (Bijimi)", "Strong bull for farming work", 520000, 750000),
                ("Sheep (Tunkiya)", "Ewes for breeding", 95000, 140000),
                ("Chicken (Kaza)", "Local breed chickens", 3500, 5500),
                ("Guinea Fowl (Zabuwa)", "Wild guinea fowl", 4200, 6800),
                ("Duck (Agwagwa)", "Local duck for eggs and meat", 5500, 8200),
                ("Turkey (Talakin Turki)", "Large turkey for special occasions", 18000, 25000),
                ("Pigeon (Tantabara)", "Carrier pigeons", 2800, 4200),
                ("Rabbit (Zomo)", "Domestic rabbits for meat", 8500, 12000),
                ("Donkey (Jaki)", "Working donkey for transport", 85000, 125000),
                ("Horse (Doki)", "Riding horse, well trained", 350000, 500000),
                ("Camel (Rakumi)", "Desert camel for transport", 680000, 950000)
            };

            return livestockItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(1, 20),
                SKU = $"LIVE_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(50, 500),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = false,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateTextileProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var textileItems = new[]
            {
                ("Ankara Fabric", "Colorful African print fabric", 2500, 4500),
                ("Atamfa Fabric", "Traditional handwoven fabric", 8500, 15000),
                ("Adire Fabric", "Indigo-dyed traditional fabric", 3500, 6800),
                ("Aso Oke Fabric", "Handwoven Yoruba textile", 12000, 18000),
                ("Cotton Fabric", "Local cotton fabric", 1800, 3200),
                ("Silk Fabric", "Imported silk material", 25000, 35000),
                ("Lace Fabric", "French lace for special occasions", 18000, 28000),
                ("Damask Fabric", "High-quality damask", 15000, 22000),
                ("Velvet Fabric", "Luxurious velvet material", 22000, 32000),
                ("Chiffon Fabric", "Light chiffon for hijabs", 3800, 6500),
                ("Satin Fabric", "Smooth satin material", 4500, 7200),
                ("Brocade Fabric", "Rich brocade with patterns", 28000, 38000),
                ("Embroidered Fabric", "Hand-embroidered designs", 35000, 45000),
                ("Tie-Dye Fabric", "Traditional tie-dye patterns", 2800, 4800),
                ("Batik Fabric", "Indonesian batik designs", 5500, 8800)
            };

            return textileItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(20, 200),
                SKU = $"TEXT_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 5),
                WeightUnit = "meters",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateTraditionalWearProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var traditionalWearItems = new[]
            {
                ("Kaftan", "Traditional flowing robe", 25000, 45000),
                ("Agbada", "Grand ceremonial robe", 65000, 95000),
                ("Hijab", "Beautiful head covering", 3500, 6800),
                ("Zanna Cap", "Traditional Hausa cap", 8500, 12000),
                ("Fulani Hat", "Traditional herder's hat", 5500, 9200),
                ("Babanriga", "Traditional long robe", 35000, 55000),
                ("Jalabiya", "Casual traditional wear", 18000, 28000),
                ("Riga", "Traditional shirt", 15000, 22000),
                ("Sokoto", "Traditional trousers", 12000, 18000),
                ("Wrapper (Ankara)", "Traditional wrapper", 8500, 14000),
                ("Gele", "Head tie for special occasions", 5500, 9800),
                ("Fila", "Traditional cap", 6800, 11500),
                ("Dashiki", "Colorful traditional shirt", 12000, 18500),
                ("Kente Cloth", "Traditional kente patterns", 45000, 65000),
                ("Buba", "Traditional blouse", 15000, 25000),
                ("Iro", "Traditional skirt", 18000, 28000),
                ("Agbari", "Traditional vest", 12000, 18000),
                ("Embroidered Robe", "Hand-embroidered kaftan", 85000, 125000)
            };

            return traditionalWearItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(10, 100),
                SKU = $"WEAR_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 3),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateLeatherProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var leatherItems = new[]
            {
                ("Leather Sandals (Takalmi)", "Handcrafted traditional sandals", 8500, 15000),
                ("Leather Bag", "Handmade leather bag", 25000, 35000),
                ("Leather Belt", "Traditional leather belt", 5500, 9800),
                ("Leather Wallet", "Crafted leather wallet", 12000, 18000),
                ("Leather Shoes", "Traditional leather shoes", 18000, 28000),
                ("Leather Purse", "Ladies leather purse", 15000, 22000),
                ("Leather Pouch", "Small leather pouch", 6800, 11000),
                ("Leather Bracelet", "Decorative leather bracelet", 2800, 4500),
                ("Leather Hat", "Traditional leather hat", 12000, 18500),
                ("Leather Jacket", "Modern leather jacket", 65000, 95000),
                ("Leather Gloves", "Work leather gloves", 8500, 12800),
                ("Leather Whip (Bulala)", "Traditional leather whip", 5500, 8200),
                ("Leather Rope", "Strong leather rope", 3500, 6000),
                ("Leather Mat", "Traditional sitting mat", 15000, 25000),
                ("Leather Bookmark", "Decorative bookmark", 1500, 2800)
            };

            return leatherItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(5, 50),
                SKU = $"LEAT_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 5),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateHandicraftProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var handicraftItems = new[]
            {
                ("Woven Basket", "Traditional grass basket", 8500, 15000),
                ("Clay Pot", "Handmade clay water pot", 5500, 9800),
                ("Wood Carving", "Traditional wood sculpture", 25000, 35000),
                ("Calabash Bowl", "Natural calabash bowl", 3500, 6200),
                ("Bead Jewelry", "Traditional bead necklace", 12000, 18000),
                ("Straw Mat", "Woven straw mat", 6800, 11500),
                ("Drum (Ganga)", "Traditional talking drum", 35000, 55000),
                ("Flute (Sarewa)", "Bamboo flute", 8500, 13000),
                ("Bronze Statue", "Traditional bronze art", 85000, 125000),
                ("Pottery Vase", "Decorative clay vase", 12000, 18500),
                ("Wooden Stool", "Carved wooden stool", 15000, 25000),
                ("Gourd Rattle", "Musical gourd instrument", 6500, 10500),
                ("Mask (Maskanci)", "Traditional ceremonial mask", 45000, 65000),
                ("Embroidered Pillow", "Hand-embroidered cushion", 18000, 28000),
                ("Brass Ornament", "Traditional brass decoration", 25000, 38000)
            };

            return handicraftItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(5, 30),
                SKU = $"HAND_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 10),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateElectronicsProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var electronicsItems = new[]
            {
                ("Mobile Phone", "Android smartphone", 85000, 125000),
                ("Radio", "Portable FM/AM radio", 12000, 18000),
                ("Fan", "Ceiling fan with remote", 35000, 55000),
                ("Flashlight", "LED rechargeable flashlight", 5500, 8500),
                ("Power Bank", "10000mAh power bank", 15000, 22000),
                ("Bluetooth Speaker", "Portable wireless speaker", 25000, 35000),
                ("Headphones", "Over-ear headphones", 18000, 28000),
                ("Calculator", "Scientific calculator", 8500, 12500),
                ("Digital Watch", "Sports digital watch", 12000, 18500),
                ("Solar Panel", "Small solar charging panel", 45000, 65000),
                ("Battery", "Rechargeable batteries pack", 6800, 10500),
                ("Charger", "Universal phone charger", 3500, 5800),
                ("USB Cable", "Data transfer cable", 2500, 4200),
                ("Memory Card", "32GB micro SD card", 8500, 13000),
                ("Wall Socket", "USB charging wall socket", 5500, 8800)
            };

            return electronicsItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(10, 100),
                SKU = $"ELEC_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 5),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateHouseholdProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var householdItems = new[]
            {
                ("Cooking Pot", "Aluminum cooking pot", 8500, 15000),
                ("Plastic Bucket", "Water storage bucket", 3500, 6200),
                ("Plastic Chair", "Stackable plastic chair", 5500, 9800),
                ("Kerosene Stove", "Portable kerosene burner", 12000, 18000),
                ("Gas Cylinder", "Small cooking gas cylinder", 25000, 35000),
                ("Mosquito Net", "Insecticide-treated net", 6800, 11000),
                ("Bed Sheet", "Cotton bed sheet set", 15000, 22000),
                ("Pillow", "Comfortable foam pillow", 8500, 12800),
                ("Blanket", "Warm cotton blanket", 18000, 28000),
                ("Lantern", "Solar-powered lantern", 12000, 18500),
                ("Water Filter", "Ceramic water filter", 35000, 55000),
                ("Broom", "Local broom (tsintsiya)", 2500, 4000),
                ("Mop", "Floor cleaning mop", 5500, 8200),
                ("Soap", "Laundry bar soap", 1500, 2800),
                ("Detergent", "Washing powder", 3500, 5800)
            };

            return householdItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(20, 150),
                SKU = $"HOME_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 15),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        private List<Product> GenerateSpiceProducts(ProductCategory category, List<ApplicationUser> vendors)
        {
            var spiceItems = new[]
            {
                ("Curry Powder", "Mixed curry spice blend", 2500, 4500),
                ("Black Pepper", "Ground black pepper", 8500, 12000),
                ("Red Pepper (Barkono)", "Dried red chili pepper", 3500, 6200),
                ("Cloves (Kanafuru)", "Whole dried cloves", 15000, 22000),
                ("Cinnamon (Kirfa)", "Ground cinnamon powder", 12000, 18000),
                ("Nutmeg", "Whole nutmeg spice", 18000, 25000),
                ("Cardamom", "Green cardamom pods", 25000, 35000),
                ("Cumin (Kharar kumba)", "Ground cumin powder", 6800, 11000),
                ("Coriander Seeds", "Whole coriander seeds", 5500, 8800),
                ("Fenugreek", "Dried fenugreek leaves", 8500, 13000),
                ("Star Anise", "Whole star anise", 22000, 32000),
                ("Thyme (Tami)", "Dried thyme leaves", 4500, 7200),
                ("Bay Leaves", "Dried bay leaves", 6500, 10500),
                ("Paprika", "Sweet paprika powder", 8500, 12800),
                ("Garlic Powder", "Ground garlic powder", 5500, 8200)
            };

            return spiceItems.Select(item => new Product
            {
                VendorId = vendors[new Random().Next(0, vendors.Count)].Id,
                CategoryId = category.Id,
                Name = item.Item1,
                Description = item.Item2,
                Price = item.Item3,
                ComparePrice = item.Item4,
                StockQuantity = new Random().Next(30, 200),
                SKU = $"SPIC_{new Random().Next(1000, 9999)}",
                Weight = new Random().Next(1, 2),
                WeightUnit = "kg",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                UpdatedDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)),
                RequiresShipping = true,
                TrackQuantity = true
            }).ToList();
        }

        // Helper methods
        private string GenerateNigerianPhoneNumber(Faker f)
        {
            var prefixes = new[] { "080", "081", "090", "070", "091", "0803", "0806", "0809", "0817", "0818" };
            var prefix = f.PickRandom(prefixes);
            var remaining = 11 - prefix.Length;
            var number = f.Random.ReplaceNumbers(new string('#', remaining));
            return prefix + number;
        }

        private string GenerateNigerianAddress(Faker f)
        {
            var streets = new[] 
            { 
                "Ahmadu Bello Way", "Independence Way", "Constitution Road", "Muhammadu Buhari Way",
                "Hospital Road", "Market Street", "Unity Road", "Peace Avenue", "Progress Street",
                "Government House Road", "Central Mosque Road", "Emir's Palace Road"
            };
            
            var areas = new[]
            {
                "GRA", "Sabon Gari", "Fagge", "Tudun Wada", "Nassarawa", "Ungogo", "Kano Municipal",
                "Wuse", "Garki", "Maitama", "Asokoro", "Kubwa", "Dutse", "Lugbe"
            };
            
            var cities = new[]
            {
                "Kano", "Kaduna", "Sokoto", "Maiduguri", "Bauchi", "Katsina", "Yola", "Gombe",
                "Dutse", "Birnin Kebbi", "Jalingo", "Minna", "Lafia", "Lokoja", "Ilorin"
            };
            
            var states = new[]
            {
                "Kano State", "Kaduna State", "Sokoto State", "Borno State", "Bauchi State",
                "Katsina State", "Adamawa State", "Gombe State", "Jigawa State", "Kebbi State",
                "Taraba State", "Niger State", "Nasarawa State", "Kogi State", "Kwara State"
            };

            return $"{f.Random.Number(1, 999)} {f.PickRandom(streets)}, {f.PickRandom(areas)}, {f.PickRandom(cities)}, {f.PickRandom(states)}, Nigeria";
        }

        private string GenerateBusinessDescription(string businessName)
        {
            var descriptions = new Dictionary<string, string>
            {
                ["Grains"] = "We are a leading supplier of quality grains and cereals sourced directly from local farmers across northern Nigeria.",
                ["Livestock"] = "Specializing in healthy livestock, we provide quality animals for farming, breeding, and consumption.",
                ["Textile"] = "Our textile business offers premium fabrics and traditional materials for modern and cultural fashion needs.",
                ["Crafts"] = "We preserve traditional craftsmanship by creating authentic handicrafts and artistic pieces.",
                ["Electronics"] = "Providing modern electronic devices and gadgets to meet the technological needs of our customers.",
                ["Leather"] = "Handcrafted leather goods made by skilled artisans using traditional and modern techniques.",
                ["Spice"] = "Sourcing the finest spices and seasonings to enhance the flavor of traditional and modern cuisines.",
                ["Fashion"] = "Traditional and modern fashion items that celebrate northern Nigerian culture and style.",
                ["Household"] = "Essential household items and appliances for comfortable modern living.",
                ["Agricultural"] = "Supporting farmers and households with quality agricultural supplies and equipment."
            };

            // Return a description based on the business name keywords
            foreach (var key in descriptions.Keys)
            {
                if (businessName.ToLower().Contains(key.ToLower()))
                {
                    return descriptions[key];
                }
            }

            return "A trusted business serving the northern Nigerian community with quality products and excellent service.";
        }
    }
}