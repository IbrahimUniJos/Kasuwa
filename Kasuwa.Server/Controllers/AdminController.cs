using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using Kasuwa.Server.Data;
using System.Security.Claims;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireAdminRole")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext context,
            ILogger<AdminController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all users with pagination
        /// </summary>
        [HttpGet("users")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] UserType? userType = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var query = _context.Users.AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => u.Email!.Contains(search) || 
                                           u.FirstName.Contains(search) || 
                                           u.LastName.Contains(search) ||
                                           (u.BusinessName != null && u.BusinessName.Contains(search)));
                }

                if (userType.HasValue)
                {
                    query = query.Where(u => u.UserType == userType.Value);
                }

                if (isActive.HasValue)
                {
                    query = query.Where(u => u.IsActive == isActive.Value);
                }

                var totalCount = await query.CountAsync();
                var users = await query
                    .OrderByDescending(u => u.DateCreated)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var userDtos = new List<UserDto>();
                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    userDtos.Add(new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email!,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        UserType = user.UserType,
                        IsActive = user.IsActive,
                        IsVendorApproved = user.IsVendorApproved,
                        BusinessName = user.BusinessName,
                        ProfileImageUrl = user.ProfileImageUrl,
                        DateCreated = user.DateCreated,
                        LastLogin = user.LastLogin,
                        Roles = roles.ToList()
                    });
                }

                return Ok(new PagedResult<UserDto>
                {
                    Items = userDtos,
                    TotalCount = totalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, "An error occurred while getting users");
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var roles = await _userManager.GetRolesAsync(user);
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserType = user.UserType,
                    IsActive = user.IsActive,
                    IsVendorApproved = user.IsVendorApproved,
                    BusinessName = user.BusinessName,
                    ProfileImageUrl = user.ProfileImageUrl,
                    DateCreated = user.DateCreated,
                    LastLogin = user.LastLogin,
                    Roles = roles.ToList()
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", id);
                return StatusCode(500, "An error occurred while getting user");
            }
        }

        /// <summary>
        /// Approve or reject vendor application
        /// </summary>
        [HttpPost("users/{id}/approve-vendor")]
        public async Task<ActionResult<AuthResponseDto>> ApproveVendor(string id, [FromBody] ApproveVendorRequestDto request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                if (user.UserType != UserType.Vendor)
                {
                    return BadRequest("User is not a vendor");
                }

                user.IsVendorApproved = request.IsApproved;
                if (request.IsApproved)
                {
                    user.VendorApprovedDate = DateTime.UtcNow;
                }

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest("Failed to update vendor status");
                }

                _logger.LogInformation("Vendor {UserId} approval status changed to {Status}", id, request.IsApproved);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = request.IsApproved ? "Vendor approved successfully" : "Vendor approval revoked"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vendor approval status");
                return StatusCode(500, "An error occurred while updating vendor status");
            }
        }

        /// <summary>
        /// Activate or deactivate user account
        /// </summary>
        [HttpPost("users/{id}/toggle-status")]
        public async Task<ActionResult<AuthResponseDto>> ToggleUserStatus(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                user.IsActive = !user.IsActive;
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest("Failed to update user status");
                }

                _logger.LogInformation("User {UserId} status changed to {Status}", id, user.IsActive ? "Active" : "Inactive");

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = user.IsActive ? "User activated successfully" : "User deactivated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling user status");
                return StatusCode(500, "An error occurred while updating user status");
            }
        }

        /// <summary>
        /// Get admin dashboard statistics
        /// </summary>
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<AdminDashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalCustomers = await _context.Users.CountAsync(u => u.UserType == UserType.Customer);
                var totalVendors = await _context.Users.CountAsync(u => u.UserType == UserType.Vendor);
                var approvedVendors = await _context.Users.CountAsync(u => u.UserType == UserType.Vendor && u.IsVendorApproved);
                var pendingVendorApplications = await _context.Users.CountAsync(u => u.UserType == UserType.Vendor && !u.IsVendorApproved);
                var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
                var inactiveUsers = await _context.Users.CountAsync(u => !u.IsActive);
                
                var firstDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var newUsersThisMonth = await _context.Users.CountAsync(u => u.DateCreated >= firstDayOfMonth);

                var stats = new AdminDashboardStatsDto
                {
                    TotalUsers = totalUsers,
                    TotalCustomers = totalCustomers,
                    TotalVendors = totalVendors,
                    ApprovedVendors = approvedVendors,
                    PendingVendorApplications = pendingVendorApplications,
                    ActiveUsers = activeUsers,
                    InactiveUsers = inactiveUsers,
                    NewUsersThisMonth = newUsersThisMonth,
                    TotalPlatformRevenue = 0.00m,
                    MonthlyPlatformRevenue = 0.00m,
                    TotalOrders = 0,
                    TotalProducts = 0
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin dashboard statistics");
                return StatusCode(500, "An error occurred while getting dashboard statistics");
            }
        }

        /// <summary>
        /// Suspend or unsuspend a user account
        /// </summary>
        [HttpPost("users/{id}/suspend")]
        public async Task<ActionResult<AuthResponseDto>> SuspendUser(string id, [FromBody] SuspensionDto request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Create user suspension record
                var suspension = new UserSuspension
                {
                    UserId = user.Id,
                    SuspendedById = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown",
                    Type = (Models.SuspensionType)(int)request.SuspensionType,
                    Reason = request.Reason,
                    SuspendedAt = DateTime.UtcNow,
                    ExpiresAt = request.SuspensionType == DTOs.SuspensionType.Temporary ? 
                        DateTime.UtcNow.Add(TimeSpan.Parse(request.Duration ?? "P1D")) : null,
                    IsActive = true,
                    FreezeOrders = request.FreezeOrders,
                    AdminNotes = request.AdminNotes
                };

                _context.UserSuspensions.Add(suspension);
                
                // Update user status
                user.IsActive = false;
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest("Failed to suspend user");
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} suspended by admin {AdminId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "User suspended successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending user {UserId}", id);
                return StatusCode(500, "An error occurred while suspending user");
            }
        }

        /// <summary>
        /// Get pending vendor applications
        /// </summary>
        [HttpGet("vendors/pending")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetPendingVendors(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Users
                    .Where(u => u.UserType == UserType.Vendor && !u.IsVendorApproved && u.IsActive);

                var totalCount = await query.CountAsync();
                var vendors = await query
                    .OrderByDescending(u => u.DateCreated)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var vendorDtos = new List<UserDto>();
                foreach (var vendor in vendors)
                {
                    var roles = await _userManager.GetRolesAsync(vendor);
                    vendorDtos.Add(new UserDto
                    {
                        Id = vendor.Id,
                        Email = vendor.Email!,
                        FirstName = vendor.FirstName,
                        LastName = vendor.LastName,
                        UserType = vendor.UserType,
                        IsActive = vendor.IsActive,
                        IsVendorApproved = vendor.IsVendorApproved,
                        BusinessName = vendor.BusinessName,
                        ProfileImageUrl = vendor.ProfileImageUrl,
                        DateCreated = vendor.DateCreated,
                        LastLogin = vendor.LastLogin,
                        Roles = roles.ToList()
                    });
                }

                return Ok(new PagedResult<UserDto>
                {
                    Items = vendorDtos,
                    TotalCount = totalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending vendors");
                return StatusCode(500, "An error occurred while getting pending vendors");
            }
        }

        /// <summary>
        /// Get platform configuration settings
        /// </summary>
        [HttpGet("settings")]
        public async Task<ActionResult<PlatformSettingsDto>> GetPlatformSettings()
        {
            try
            {
                // In a real implementation, these would be retrieved from a configuration table
                var settings = new PlatformSettingsDto
                {
                    General = new GeneralSettingsDto
                    {
                        PlatformName = "Kasuwa Marketplace",
                        DefaultCommissionRate = 5.0m,
                        MinimumOrderAmount = 10.00m,
                        TaxRate = 8.5m
                    },
                    Moderation = new ModerationSettingsDto
                    {
                        AutoApproveProducts = false,
                        RequireVendorVerification = true,
                        ReviewModerationEnabled = true
                    },
                    Payments = new PaymentSettingsDto
                    {
                        SupportedPaymentMethods = new List<string> { "CreditCard", "PayPal", "BankTransfer" },
                        PaymentProcessingFee = 2.9m,
                        VendorPayoutSchedule = "Weekly"
                    }
                };

                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platform settings");
                return StatusCode(500, "An error occurred while getting platform settings");
            }
        }

        /// <summary>
        /// Update platform configuration settings
        /// </summary>
        [HttpPut("settings")]
        public async Task<ActionResult<AuthResponseDto>> UpdatePlatformSettings([FromBody] PlatformSettingsDto settings)
        {
            try
            {
                // In a real implementation, these would be saved to a configuration table
                // For now, we'll just log the update
                _logger.LogInformation("Platform settings updated by admin {AdminId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Platform settings updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating platform settings");
                return StatusCode(500, "An error occurred while updating platform settings");
            }
        }

        /// <summary>
        /// Get sales report
        /// </summary>
        [HttpGet("reports/sales")]
        public async Task<ActionResult<SalesReportDto>> GetSalesReport([FromQuery] SalesReportParametersDto parameters)
        {
            try
            {
                // In a real implementation, this would query actual sales data
                var report = new SalesReportDto
                {
                    ReportPeriod = new DateRangeDto
                    {
                        StartDate = parameters.StartDate,
                        EndDate = parameters.EndDate
                    },
                    Summary = new SalesSummaryDto
                    {
                        TotalSales = 0,
                        TotalOrders = 0,
                        AverageOrderValue = 0,
                        TotalCommission = 0
                    }
                };

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating sales report");
                return StatusCode(500, "An error occurred while generating sales report");
            }
        }

        /// <summary>
        /// Get user activity report
        /// </summary>
        [HttpGet("reports/user-activity")]
        public async Task<ActionResult<UserActivityReportDto>> GetUserActivityReport()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
                
                var report = new UserActivityReportDto
                {
                    TotalUsers = totalUsers,
                    ActiveUsers = activeUsers,
                    NewRegistrations = 0,
                    UsersByRole = new Dictionary<string, int>
                    {
                        ["Customers"] = await _context.Users.CountAsync(u => u.UserType == UserType.Customer),
                        ["Vendors"] = await _context.Users.CountAsync(u => u.UserType == UserType.Vendor)
                    },
                    UserActivity = new UserActivityMetricsDto
                    {
                        DailyActiveUsers = 0,
                        WeeklyActiveUsers = 0,
                        MonthlyActiveUsers = activeUsers
                    }
                };

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating user activity report");
                return StatusCode(500, "An error occurred while generating user activity report");
            }
        }

        /// <summary>
        /// Get audit logs
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<ActionResult<PagedResult<AuditLogDto>>> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                // In a real implementation, this would query actual audit logs
                var logs = new PagedResult<AuditLogDto>
                {
                    Items = new List<AuditLogDto>(),
                    TotalCount = 0,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = 0
                };

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting audit logs");
                return StatusCode(500, "An error occurred while getting audit logs");
            }
        }
    }

    // Additional DTOs for admin operations
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ApproveVendorRequestDto
    {
        public bool IsApproved { get; set; }
    }
}