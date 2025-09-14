# Backend Technical Specifications
## Kasuwa Online Marketplace Platform

**Document Version:** 1.0  
**Date:** December 2024  
**Technology Stack:** ASP.NET Core 9.0 with Identity Framework  

---

## 1. System Architecture Overview

### 1.1 Architecture Pattern
- **MVC Architecture** with Repository Pattern
- **ASP.NET Core Identity** for authentication and authorization
- **Entity Framework Core** for data access
- **Dependency Injection** for IoC
- **RESTful API** design principles

### 1.2 Project Structure
```
Kasuwa.Server/
??? Controllers/          # API Controllers
??? Models/              # DTOs, ViewModels, and Request/Response models
??? Services/            # Business Logic Services
??? Repositories/        # Data Access Layer
??? Entities/           # Domain Entities
??? Data/               # DbContext and Configurations
??? Middleware/         # Custom Middleware
??? Extensions/         # Extension Methods
??? Configurations/     # Configuration Classes
??? Validators/         # FluentValidation Validators
??? Helpers/           # Utility Classes
??? Constants/         # Application Constants
??? wwwroot/           # Static files and uploads
```

---

## 2. Domain Entities

### 2.1 Identity Entities (ASP.NET Core Identity)

#### 2.1.1 ApplicationUser
```csharp
public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public UserProfile? Profile { get; set; }
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Product> Products { get; set; } = new List<Product>(); // For vendors
    public ICollection<Product> WishlistProducts { get; set; } = new List<Product>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}

public enum UserRole
{
    Customer = 1,
    Vendor = 2,
    Admin = 3
}
```

#### 2.1.2 ApplicationRole
```csharp
public class ApplicationRole : IdentityRole<Guid>
{
    public ApplicationRole() : base() { }
    public ApplicationRole(string roleName) : base(roleName) { }
    
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### 2.2 Core Business Entities

#### 2.2.1 Product Entity
```csharp
public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Draft;
    public Guid VendorId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Weight { get; set; }
    public string? Dimensions { get; set; }
    public bool IsFeatured { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Calculated Properties
    public decimal EffectivePrice => DiscountPrice ?? Price;
    public bool IsInStock => StockQuantity > 0;
    public bool IsOnSale => DiscountPrice.HasValue && DiscountPrice < Price;
    
    // Navigation Properties
    public ApplicationUser Vendor { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<ApplicationUser> WishlistedByUsers { get; set; } = new List<ApplicationUser>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}

public enum ProductStatus
{
    Draft = 1,
    Active = 2,
    Inactive = 3,
    OutOfStock = 4,
    Discontinued = 5,
    PendingApproval = 6,
    Rejected = 7
}
```

#### 2.2.2 Category Entity
```csharp
public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public string? Icon { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
```

#### 2.2.3 Order Entity
```csharp
public class Order
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    
    // Address Information (JSON serialized)
    public string ShippingAddress { get; set; } = string.Empty;
    public string BillingAddress { get; set; } = string.Empty;
    
    // Payment Information
    public string? PaymentMethod { get; set; }
    public string? PaymentTransactionId { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? PaymentGatewayResponse { get; set; }
    
    // Additional Info
    public string? Notes { get; set; }
    public string? TrackingNumber { get; set; }
    public string? ShippingCarrier { get; set; }
    
    // Navigation Properties
    public ApplicationUser Customer { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
}

public enum OrderStatus
{
    Pending = 1,
    Confirmed = 2,
    Processing = 3,
    Shipped = 4,
    Delivered = 5,
    Cancelled = 6,
    Refunded = 7,
    PartiallyRefunded = 8
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Refunded = 4,
    PartiallyRefunded = 5,
    Cancelled = 6
}
```

---

## 3. API Endpoints Specification

### 3.1 Authentication & Authorization Endpoints

#### 3.1.1 Auth Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    
    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    
    // POST: api/auth/refresh-token
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
    
    // POST: api/auth/logout
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    
    // POST: api/auth/forgot-password
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    
    // POST: api/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    
    // POST: api/auth/confirm-email
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailRequest request)
    
    // POST: api/auth/resend-confirmation
    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendEmailConfirmation(ResendConfirmationRequest request)
}
```

#### 3.1.2 Request/Response Models
```csharp
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.Customer;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### 3.2 Products API

#### 3.2.1 Products Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    // GET: api/products
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterRequest filter)
    
    // GET: api/products/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    
    // GET: api/products/featured
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts([FromQuery] int count = 10)
    
    // GET: api/products/search
    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts([FromQuery] ProductSearchRequest request)
    
    // POST: api/products
    [HttpPost]
    [Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> CreateProduct(CreateProductRequest request)
    
    // PUT: api/products/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductRequest request)
    
    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    
    // GET: api/products/{id}/related
    [HttpGet("{id}/related")]
    public async Task<IActionResult> GetRelatedProducts(Guid id, [FromQuery] int count = 5)
    
    // POST: api/products/{id}/images
    [HttpPost("{id}/images")]
    [Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> UploadProductImages(Guid id, [FromForm] ProductImageUploadRequest request)
}
```

#### 3.2.2 Product Request/Response Models
```csharp
public class ProductFilterRequest : PaginationRequest
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? VendorId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinRating { get; set; }
    public ProductStatus? Status { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? InStock { get; set; }
    public string SortBy { get; set; } = "CreatedAt";
    public string SortDirection { get; set; } = "desc";
    public string? Tags { get; set; }
}

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal EffectivePrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsInStock { get; set; }
    public bool IsOnSale { get; set; }
    public ProductStatus Status { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public Guid VendorId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? PrimaryImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductDetailDto : ProductDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public string? Dimensions { get; set; }
    public string? Tags { get; set; }
    public List<ProductAttributeDto> Attributes { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ReviewDto> RecentReviews { get; set; } = new();
    public List<ProductDto> RelatedProducts { get; set; } = new();
    public VendorInfoDto VendorInfo { get; set; } = null!;
}
```

### 3.3 Orders API

#### 3.3.1 Orders Controller
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    // GET: api/orders
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderFilterRequest filter)
    
    // GET: api/orders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(Guid id)
    
    // POST: api/orders
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    
    // PUT: api/orders/{id}/status
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, UpdateOrderStatusRequest request)
    
    // POST: api/orders/{id}/cancel
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, CancelOrderRequest request)
    
    // GET: api/orders/{id}/invoice
    [HttpGet("{id}/invoice")]
    public async Task<IActionResult> GetOrderInvoice(Guid id)
    
    // POST: api/orders/{id}/refund
    [HttpPost("{id}/refund")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RefundOrder(Guid id, RefundOrderRequest request)
}
```

### 3.4 Cart API

#### 3.4.1 Cart Controller
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CartController : ControllerBase
{
    // GET: api/cart
    [HttpGet]
    public async Task<IActionResult> GetCart()
    
    // POST: api/cart/items
    [HttpPost("items")]
    public async Task<IActionResult> AddToCart(AddToCartRequest request)
    
    // PUT: api/cart/items/{productId}
    [HttpPut("items/{productId}")]
    public async Task<IActionResult> UpdateCartItem(Guid productId, UpdateCartItemRequest request)
    
    // DELETE: api/cart/items/{productId}
    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveFromCart(Guid productId)
    
    // DELETE: api/cart
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    
    // POST: api/cart/items/bulk
    [HttpPost("items/bulk")]
    public async Task<IActionResult> AddBulkToCart(BulkAddToCartRequest request)
}
```

---

## 4. Service Layer Architecture

### 4.1 Core Service Interfaces

#### 4.1.1 IProductService
```csharp
public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterRequest filter);
    Task<ProductDetailDto?> GetProductByIdAsync(Guid id);
    Task<ProductDto> CreateProductAsync(CreateProductRequest request, Guid vendorId);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request, Guid vendorId);
    Task<bool> DeleteProductAsync(Guid id, Guid vendorId);
    Task<List<ProductDto>> GetFeaturedProductsAsync(int count = 10);
    Task<List<ProductDto>> GetRelatedProductsAsync(Guid productId, int count = 5);
    Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequest request);
    Task<bool> UpdateStockAsync(Guid productId, int quantity);
    Task<List<ProductDto>> GetProductsByVendorAsync(Guid vendorId, ProductFilterRequest filter);
}
```

#### 4.1.2 IOrderService
```csharp
public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, Guid customerId);
    Task<PagedResult<OrderDto>> GetOrdersAsync(OrderFilterRequest filter, Guid userId, string userRole);
    Task<OrderDetailDto?> GetOrderByIdAsync(Guid id, Guid userId, string userRole);
    Task<bool> UpdateOrderStatusAsync(Guid id, OrderStatus status, Guid updatedBy, string? notes = null);
    Task<bool> CancelOrderAsync(Guid id, Guid userId, string reason);
    Task<OrderSummaryDto> GetOrderSummaryAsync(Guid customerId);
    Task<string> GenerateOrderNumberAsync();
    Task<bool> ProcessRefundAsync(Guid orderId, decimal amount, Guid processedBy);
}
```

#### 4.1.3 ICartService
```csharp
public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId);
    Task<CartDto> AddToCartAsync(Guid userId, Guid productId, int quantity);
    Task<CartDto> UpdateCartItemAsync(Guid userId, Guid productId, int quantity);
    Task<bool> RemoveFromCartAsync(Guid userId, Guid productId);
    Task<bool> ClearCartAsync(Guid userId);
    Task<int> GetCartItemCountAsync(Guid userId);
    Task<decimal> GetCartTotalAsync(Guid userId);
    Task<bool> ValidateCartAsync(Guid userId);
}
```

#### 4.1.4 IUserService
```csharp
public interface IUserService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<UserDto?> GetUserProfileAsync(Guid userId);
    Task<UserDto> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request);
    Task<bool> SendEmailVerificationAsync(Guid userId);
    Task<bool> ConfirmEmailAsync(string token);
    Task<bool> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request);
    Task<PagedResult<UserDto>> GetUsersAsync(UserFilterRequest filter);
    Task<bool> ActivateUserAsync(Guid userId);
    Task<bool> DeactivateUserAsync(Guid userId);
}
```

---

## 5. Repository Pattern Implementation

### 5.1 Generic Repository Interface
```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<PagedResult<T>> GetPagedAsync(int page, int pageSize);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    IQueryable<T> Query();
    Task<int> CountAsync();
    Task<int> SaveChangesAsync();
}
```

### 5.2 Specialized Repository Interfaces

#### 5.2.1 IProductRepository
```csharp
public interface IProductRepository : IRepository<Product>
{
    Task<PagedResult<Product>> GetFilteredProductsAsync(ProductFilterRequest filter);
    Task<List<Product>> GetFeaturedProductsAsync(int count);
    Task<List<Product>> GetProductsByCategoryAsync(Guid categoryId);
    Task<List<Product>> GetProductsByVendorAsync(Guid vendorId);
    Task<bool> IsSkuUniqueAsync(string sku, Guid? excludeProductId = null);
    Task<List<Product>> GetRelatedProductsAsync(Guid productId, Guid categoryId, int count);
    Task<PagedResult<Product>> SearchProductsAsync(string searchTerm, ProductFilterRequest filter);
    Task<Dictionary<Guid, decimal>> GetAverageRatingsAsync(List<Guid> productIds);
    Task<Dictionary<Guid, int>> GetReviewCountsAsync(List<Guid> productIds);
}
```

#### 5.2.2 IOrderRepository
```csharp
public interface IOrderRepository : IRepository<Order>
{
    Task<PagedResult<Order>> GetOrdersByCustomerAsync(Guid customerId, OrderFilterRequest filter);
    Task<PagedResult<Order>> GetOrdersByVendorAsync(Guid vendorId, OrderFilterRequest filter);
    Task<Order?> GetOrderWithItemsAsync(Guid orderId);
    Task<List<Order>> GetRecentOrdersAsync(int count);
    Task<OrderSummaryDto> GetOrderSummaryAsync(Guid customerId);
    Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId);
    Task<List<Order>> GetOrdersByStatusAsync(OrderStatus status);
    Task<decimal> GetTotalSalesAsync(Guid vendorId, DateTime? fromDate = null, DateTime? toDate = null);
}
```

---

## 6. Database Configuration

### 6.1 ApplicationDbContext
```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // DbSets
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<ProductAttribute> ProductAttributes { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }
    public DbSet<ReviewHelpfulness> ReviewHelpfulness { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        
        // Configure Identity tables with custom names
        modelBuilder.Entity<ApplicationUser>().ToTable("Users");
        modelBuilder.Entity<ApplicationRole>().ToTable("Roles");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
    }
}
```

### 6.2 Entity Configurations

#### 6.2.1 Product Configuration
```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(p => p.SKU)
            .IsUnique();
            
        builder.Property(p => p.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(p => p.DiscountPrice)
            .HasColumnType("decimal(18,2)");
            
        builder.Property(p => p.Weight)
            .HasColumnType("decimal(8,2)");
            
        builder.Property(p => p.Description)
            .HasMaxLength(2000);
            
        builder.Property(p => p.ShortDescription)
            .HasMaxLength(500);
            
        // Relationships
        builder.HasOne(p => p.Vendor)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Many-to-many for wishlist
        builder.HasMany(p => p.WishlistedByUsers)
            .WithMany(u => u.WishlistProducts)
            .UsingEntity("UserWishlist");
            
        // Indexes for performance
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.VendorId);
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.Price);
        builder.HasIndex(p => p.CreatedAt);
        builder.HasIndex(p => p.IsFeatured);
    }
}
```

#### 6.2.2 Order Configuration
```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        
        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();
            
        builder.Property(o => o.SubTotal)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(o => o.TaxAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(o => o.ShippingAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(o => o.DiscountAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(o => o.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("USD");
            
        builder.Property(o => o.ShippingAddress)
            .IsRequired()
            .HasMaxLength(1000);
            
        builder.Property(o => o.BillingAddress)
            .IsRequired()
            .HasMaxLength(1000);
            
        // Relationships
        builder.HasOne(o => o.Customer)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.OrderDate);
        builder.HasIndex(o => o.PaymentStatus);
    }
}
```

---

## 7. Security Implementation

### 7.1 JWT Configuration
```csharp
public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationInHours { get; set; } = 24;
    public int RefreshTokenExpirationInDays { get; set; } = 7;
}

public interface IJwtTokenService
{
    string GenerateToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    Task<bool> ValidateRefreshTokenAsync(string refreshToken, Guid userId);
    Task SaveRefreshTokenAsync(Guid userId, string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
}
```

### 7.2 Authorization Policies
```csharp
public static class PolicyNames
{
    public const string CustomerOnly = "CustomerOnly";
    public const string VendorOnly = "VendorOnly";
    public const string AdminOnly = "AdminOnly";
    public const string VendorOrAdmin = "VendorOrAdmin";
    public const string CustomerOrVendor = "CustomerOrVendor";
    public const string OwnerOrAdmin = "OwnerOrAdmin";
}

public static class AuthorizationPolicies
{
    public static void ConfigurePolicies(AuthorizationOptions options)
    {
        options.AddPolicy(PolicyNames.CustomerOnly, policy =>
            policy.RequireRole("Customer"));
            
        options.AddPolicy(PolicyNames.VendorOnly, policy =>
            policy.RequireRole("Vendor"));
            
        options.AddPolicy(PolicyNames.AdminOnly, policy =>
            policy.RequireRole("Admin"));
            
        options.AddPolicy(PolicyNames.VendorOrAdmin, policy =>
            policy.RequireRole("Vendor", "Admin"));
            
        options.AddPolicy(PolicyNames.CustomerOrVendor, policy =>
            policy.RequireRole("Customer", "Vendor"));
    }
}
```

---

## 8. Validation with FluentValidation

### 8.1 Product Validators
```csharp
public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(255).WithMessage("Product name cannot exceed 255 characters");
            
        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required")
            .MaximumLength(50).WithMessage("SKU cannot exceed 50 characters")
            .Matches("^[A-Z0-9-]+$").WithMessage("SKU can only contain uppercase letters, numbers, and hyphens");
            
        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0")
            .LessThan(1000000).WithMessage("Price cannot exceed $1,000,000");
            
        RuleFor(x => x.DiscountPrice)
            .LessThan(x => x.Price).When(x => x.DiscountPrice.HasValue)
            .WithMessage("Discount price must be less than regular price");
            
        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative");
            
        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required");
            
        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");
            
        RuleFor(x => x.ShortDescription)
            .MaximumLength(500).WithMessage("Short description cannot exceed 500 characters");
    }
}

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        // Similar rules as CreateProductRequestValidator
        // but with conditional validation for partial updates
    }
}
```

### 8.2 Order Validators
```csharp
public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must contain at least one item")
            .Must(items => items.All(item => item.Quantity > 0))
            .WithMessage("All items must have quantity greater than 0");
            
        RuleFor(x => x.ShippingAddress)
            .NotNull().WithMessage("Shipping address is required");
            
        RuleFor(x => x.BillingAddress)
            .NotNull().WithMessage("Billing address is required");
            
        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required")
            .Must(BeValidPaymentMethod).WithMessage("Invalid payment method");
    }
    
    private bool BeValidPaymentMethod(string paymentMethod)
    {
        var validMethods = new[] { "CreditCard", "PayPal", "Stripe", "BankTransfer" };
        return validMethods.Contains(paymentMethod);
    }
}
```

---

## 9. Error Handling & Logging

### 9.1 Global Exception Middleware
```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred. TraceId: {TraceId}", 
                context.TraceIdentifier);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = new ApiResponse<object>
        {
            Success = false,
            Message = GetErrorMessage(exception),
            TraceId = context.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };

        context.Response.StatusCode = GetStatusCode(exception);
        context.Response.ContentType = "application/json";

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var jsonResponse = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(jsonResponse);
    }

    private static string GetErrorMessage(Exception exception)
    {
        return exception switch
        {
            ValidationException => "Validation failed",
            NotFoundException => "Resource not found",
            UnauthorizedException => "Unauthorized access",
            ForbiddenException => "Access forbidden",
            BusinessRuleException => exception.Message,
            _ => "An error occurred while processing your request"
        };
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            ValidationException => 400,
            NotFoundException => 404,
            UnauthorizedException => 401,
            ForbiddenException => 403,
            BusinessRuleException => 422,
            _ => 500
        };
    }
}
```

### 9.2 Custom Exceptions
```csharp
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
    public NotFoundException(string name, object key) : base($"{name} with key '{key}' was not found") { }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
    public ValidationException(string message, IDictionary<string, string[]> errors) : base(message)
    {
        Errors = errors;
    }
    
    public IDictionary<string, string[]> Errors { get; } = new Dictionary<string, string[]>();
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}

public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}
```

---

## 10. Configuration & Startup

### 10.1 Application Settings
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=KasuwaDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "Secret": "your-super-secret-key-that-should-be-at-least-256-bits-long",
    "Issuer": "Kasuwa",
    "Audience": "KasuwaUsers",
    "ExpirationInHours": 24,
    "RefreshTokenExpirationInDays": 7
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "SenderEmail": "noreply@kasuwa.com",
    "SenderName": "Kasuwa Marketplace",
    "Username": "",
    "Password": ""
  },
  "FileUploadSettings": {
    "MaxFileSize": 10485760,
    "AllowedExtensions": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    "UploadPath": "wwwroot/uploads",
    "MaxFilesPerProduct": 10
  },
  "CacheSettings": {
    "DefaultExpirationMinutes": 30,
    "ProductCacheMinutes": 60,
    "CategoryCacheMinutes": 120
  },
  "PaginationSettings": {
    "DefaultPageSize": 20,
    "MaxPageSize": 100
  },
  "BusinessSettings": {
    "DefaultCurrency": "USD",
    "TaxRate": 0.08,
    "ShippingRate": 5.99,
    "FreeShippingThreshold": 50.00,
    "OrderNumberPrefix": "KSW"
  }
}
```

### 10.2 Program.cs Configuration
```csharp
var builder = WebApplication.CreateBuilder(args);

// Configuration
var configuration = builder.Configuration;

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// Identity Configuration
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    
    // User settings
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
    
    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT Configuration
var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };
});

// Authorization Policies
builder.Services.AddAuthorization(AuthorizationPolicies.ConfigurePolicies);

// Services Registration
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// Repositories Registration
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateProductRequestValidator>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", builder =>
        builder.WithOrigins("https://localhost:61831")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials());
});

// Controllers and API Explorer
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Kasuwa API", Version = "v1" });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowSpecificOrigin");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
    
    await DatabaseSeeder.SeedAsync(context, userManager, roleManager);
}

app.Run();
```

---

## 11. Testing Strategy

### 11.1 Unit Testing Structure
```csharp
[TestClass]
public class ProductServiceTests
{
    private Mock<IProductRepository> _mockProductRepository;
    private Mock<IMapper> _mockMapper;
    private Mock<ILogger<ProductService>> _mockLogger;
    private ProductService _productService;

    [TestInitialize]
    public void Setup()
    {
        _mockProductRepository = new Mock<IProductRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockLogger = new Mock<ILogger<ProductService>>();
        
        _productService = new ProductService(
            _mockProductRepository.Object,
            _mockMapper.Object,
            _mockLogger.Object);
    }

    [TestMethod]
    public async Task GetProductByIdAsync_ValidId_ReturnsProduct()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = new Product { Id = productId, Name = "Test Product" };
        var productDto = new ProductDetailDto { Id = productId, Name = "Test Product" };
        
        _mockProductRepository.Setup(r => r.GetByIdAsync(productId))
            .ReturnsAsync(product);
        _mockMapper.Setup(m => m.Map<ProductDetailDto>(product))
            .Returns(productDto);

        // Act
        var result = await _productService.GetProductByIdAsync(productId);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(productId, result.Id);
        Assert.AreEqual("Test Product", result.Name);
    }

    [TestMethod]
    public async Task GetProductByIdAsync_InvalidId_ReturnsNull()
    {
        // Arrange
        var productId = Guid.NewGuid();
        _mockProductRepository.Setup(r => r.GetByIdAsync(productId))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _productService.GetProductByIdAsync(productId);

        // Assert
        Assert.IsNull(result);
    }
}
```

---

## 12. Performance Considerations

### 12.1 Caching Strategy
```csharp
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key);
    Task RemoveByPatternAsync(string pattern);
}

public static class CacheKeys
{
    public const string Product = "product:{0}";
    public const string Products = "products:{0}";
    public const string Categories = "categories";
    public const string FeaturedProducts = "featured-products";
    public const string UserCart = "user-cart:{0}";
    public const string ProductReviews = "product-reviews:{0}";
}
```

### 12.2 Database Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_VendorId ON Products(VendorId);
CREATE INDEX IX_Products_Status ON Products(Status);
CREATE INDEX IX_Products_Price ON Products(Price);
CREATE INDEX IX_Products_CreatedAt ON Products(CreatedAt);
CREATE INDEX IX_Products_IsFeatured ON Products(IsFeatured);

CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_PaymentStatus ON Orders(PaymentStatus);

CREATE INDEX IX_Reviews_ProductId ON Reviews(ProductId);
CREATE INDEX IX_Reviews_CustomerId ON Reviews(CustomerId);
CREATE INDEX IX_Reviews_Status ON Reviews(Status);

CREATE INDEX IX_CartItems_UserId ON CartItems(UserId);
CREATE INDEX IX_CartItems_ProductId ON CartItems(ProductId);
```

---

This comprehensive backend specification provides a solid foundation for implementing the Kasuwa Online Marketplace Platform using ASP.NET Core 9.0 with Identity Framework, following industry best practices for scalability, security, and maintainability.