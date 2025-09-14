using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using Kasuwa.Server.Data;

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