using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireVendorRole")]
    public class VendorController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VendorController> _logger;

        public VendorController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<VendorController> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get vendor application status
        /// </summary>
        [HttpGet("application-status")]
        public async Task<ActionResult<VendorApplicationStatusDto>> GetApplicationStatus()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var status = new VendorApplicationStatusDto
                {
                    IsApproved = user.IsVendorApproved,
                    ApprovedDate = user.VendorApprovedDate,
                    ApplicationStatus = user.IsVendorApproved ? "Approved" : "Pending",
                    BusinessName = user.BusinessName,
                    BusinessDescription = user.BusinessDescription
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting application status for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting application status");
            }
        }

        /// <summary>
        /// Update vendor business profile
        /// </summary>
        [HttpPut("business-profile")]
        public async Task<ActionResult<AuthResponseDto>> UpdateBusinessProfile([FromBody] UpdateVendorBusinessProfileDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                user.BusinessName = request.BusinessName;
                user.BusinessDescription = request.BusinessDescription;
                user.BusinessAddress = request.BusinessAddress;
                user.BusinessPhone = request.BusinessPhone;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }

                _logger.LogInformation("Vendor {VendorId} updated business profile", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Business profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating business profile for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating business profile"
                });
            }
        }

        /// <summary>
        /// Get vendor dashboard statistics
        /// </summary>
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<VendorDashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // For now, return mock data since we don't have products/orders tables yet
                // In a real implementation, you would query these from the database
                var stats = new VendorDashboardStatsDto
                {
                    TotalProducts = 0,
                    ActiveProducts = 0,
                    TotalOrders = 0,
                    PendingOrders = 0,
                    TotalRevenue = 0.00m,
                    MonthlyRevenue = 0.00m,
                    TotalCustomers = 0,
                    AverageRating = 0.0
                };

                _logger.LogInformation("Retrieved dashboard stats for vendor {VendorId}", userId);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting dashboard statistics");
            }
        }
    }
}