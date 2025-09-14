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
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<ProfileController> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _context.Users
                    .Include(u => u.Addresses)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                var userProfile = new UserProfileDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserType = user.UserType,
                    ProfileImageUrl = user.ProfileImageUrl,
                    BusinessName = user.BusinessName,
                    BusinessDescription = user.BusinessDescription,
                    DateCreated = user.DateCreated,
                    LastLogin = user.LastLogin,
                    Addresses = user.Addresses.Select(a => new UserAddressDto
                    {
                        Id = a.Id,
                        AddressLine1 = a.AddressLine1,
                        AddressLine2 = a.AddressLine2,
                        City = a.City,
                        State = a.State,
                        PostalCode = a.PostalCode,
                        Country = a.Country,
                        IsDefault = a.IsDefault
                    }).ToList()
                };

                return Ok(userProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting user profile");
            }
        }

        /// <summary>
        /// Update user profile
        /// </summary>
        [HttpPut]
        public async Task<ActionResult<AuthResponseDto>> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.BusinessName = request.BusinessName;
                user.BusinessDescription = request.BusinessDescription;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }

                _logger.LogInformation("User {UserId} updated profile successfully", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating profile"
                });
            }
        }

        /// <summary>
        /// Get user addresses
        /// </summary>
        [HttpGet("addresses")]
        public async Task<ActionResult<List<UserAddressDto>>> GetAddresses()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var addresses = await _context.UserAddresses
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.IsDefault)
                    .ThenBy(a => a.Id)
                    .Select(a => new UserAddressDto
                    {
                        Id = a.Id,
                        AddressLine1 = a.AddressLine1,
                        AddressLine2 = a.AddressLine2,
                        City = a.City,
                        State = a.State,
                        PostalCode = a.PostalCode,
                        Country = a.Country,
                        IsDefault = a.IsDefault
                    })
                    .ToListAsync();

                return Ok(addresses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting addresses for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting addresses");
            }
        }

        /// <summary>
        /// Add new address
        /// </summary>
        [HttpPost("addresses")]
        public async Task<ActionResult<AuthResponseDto>> AddAddress([FromBody] AddUserAddressDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // If this is set as default, update other addresses to not be default
                if (request.IsDefault)
                {
                    var existingAddresses = await _context.UserAddresses
                        .Where(a => a.UserId == userId && a.IsDefault)
                        .ToListAsync();

                    foreach (var addr in existingAddresses)
                    {
                        addr.IsDefault = false;
                    }
                }

                var address = new UserAddress
                {
                    UserId = userId,
                    AddressLine1 = request.AddressLine1,
                    AddressLine2 = request.AddressLine2,
                    City = request.City,
                    State = request.State,
                    PostalCode = request.PostalCode,
                    Country = request.Country,
                    IsDefault = request.IsDefault
                };

                _context.UserAddresses.Add(address);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} added new address", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Address added successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding address for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while adding address"
                });
            }
        }

        /// <summary>
        /// Update address
        /// </summary>
        [HttpPut("addresses/{id}")]
        public async Task<ActionResult<AuthResponseDto>> UpdateAddress(int id, [FromBody] AddUserAddressDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _context.UserAddresses
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (address == null)
                {
                    return NotFound("Address not found");
                }

                // If this is set as default, update other addresses to not be default
                if (request.IsDefault && !address.IsDefault)
                {
                    var existingAddresses = await _context.UserAddresses
                        .Where(a => a.UserId == userId && a.IsDefault)
                        .ToListAsync();

                    foreach (var addr in existingAddresses)
                    {
                        addr.IsDefault = false;
                    }
                }

                address.AddressLine1 = request.AddressLine1;
                address.AddressLine2 = request.AddressLine2;
                address.City = request.City;
                address.State = request.State;
                address.PostalCode = request.PostalCode;
                address.Country = request.Country;
                address.IsDefault = request.IsDefault;

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} updated address {AddressId}", userId, id);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Address updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating address {AddressId} for user {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating address"
                });
            }
        }

        /// <summary>
        /// Delete address
        /// </summary>
        [HttpDelete("addresses/{id}")]
        public async Task<ActionResult<AuthResponseDto>> DeleteAddress(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _context.UserAddresses
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (address == null)
                {
                    return NotFound("Address not found");
                }

                _context.UserAddresses.Remove(address);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} deleted address {AddressId}", userId, id);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Address deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting address {AddressId} for user {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting address"
                });
            }
        }

        /// <summary>
        /// Set default address
        /// </summary>
        [HttpPut("addresses/{id}/default")]
        public async Task<ActionResult<AuthResponseDto>> SetDefaultAddress(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _context.UserAddresses
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (address == null)
                {
                    return NotFound("Address not found");
                }

                // Update other addresses to not be default
                var existingAddresses = await _context.UserAddresses
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ToListAsync();

                foreach (var addr in existingAddresses)
                {
                    addr.IsDefault = false;
                }

                address.IsDefault = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} set address {AddressId} as default", userId, id);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Default address updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting default address {AddressId} for user {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while setting default address"
                });
            }
        }
    }
}