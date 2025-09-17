using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddressesController : ControllerBase
    {
        private readonly IUserAddressService _userAddressService;
        private readonly ILogger<AddressesController> _logger;

        public AddressesController(IUserAddressService userAddressService, ILogger<AddressesController> logger)
        {
            _userAddressService = userAddressService;
            _logger = logger;
        }

        /// <summary>
        /// Get all addresses for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<UserAddressDto>>> GetUserAddresses()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var addresses = await _userAddressService.GetUserAddressesAsync(userId);
                return Ok(addresses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user addresses");
                return StatusCode(500, "An error occurred while retrieving addresses");
            }
        }

        /// <summary>
        /// Get a specific address by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserAddressDto>> GetAddress(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _userAddressService.GetAddressByIdAsync(id, userId);
                if (address == null)
                {
                    return NotFound("Address not found");
                }

                return Ok(address);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting address {AddressId}", id);
                return StatusCode(500, "An error occurred while retrieving the address");
            }
        }

        /// <summary>
        /// Create a new address
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<UserAddressDto>> CreateAddress([FromBody] CreateUserAddressDto createAddressDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _userAddressService.CreateAddressAsync(createAddressDto, userId);

                _logger.LogInformation("Created address {AddressId} for user {UserId}", address.Id, userId);

                return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, address);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating address");
                return StatusCode(500, "An error occurred while creating the address");
            }
        }

        /// <summary>
        /// Update an existing address
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<UserAddressDto>> UpdateAddress(int id, [FromBody] UpdateUserAddressDto updateAddressDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _userAddressService.UpdateAddressAsync(id, updateAddressDto, userId);
                if (address == null)
                {
                    return NotFound("Address not found");
                }

                _logger.LogInformation("Updated address {AddressId} for user {UserId}", id, userId);

                return Ok(address);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You don't have permission to update this address");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating address {AddressId}", id);
                return StatusCode(500, "An error occurred while updating the address");
            }
        }

        /// <summary>
        /// Delete an address
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAddress(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _userAddressService.DeleteAddressAsync(id, userId);
                if (!success)
                {
                    return NotFound("Address not found");
                }

                _logger.LogInformation("Deleted address {AddressId} for user {UserId}", id, userId);

                return Ok(new { message = "Address deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You don't have permission to delete this address");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting address {AddressId}", id);
                return StatusCode(500, "An error occurred while deleting the address");
            }
        }

        /// <summary>
        /// Set an address as default
        /// </summary>
        [HttpPut("{id}/set-default")]
        public async Task<ActionResult<UserAddressDto>> SetDefaultAddress(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _userAddressService.SetDefaultAddressAsync(id, userId);
                if (address == null)
                {
                    return NotFound("Address not found");
                }

                _logger.LogInformation("Set address {AddressId} as default for user {UserId}", id, userId);

                return Ok(address);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You don't have permission to modify this address");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting default address {AddressId}", id);
                return StatusCode(500, "An error occurred while setting the default address");
            }
        }

        /// <summary>
        /// Get the default address for the current user
        /// </summary>
        [HttpGet("default")]
        public async Task<ActionResult<UserAddressDto>> GetDefaultAddress()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var address = await _userAddressService.GetDefaultAddressAsync(userId);
                if (address == null)
                {
                    return NotFound("No default address found");
                }

                return Ok(address);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting default address for user");
                return StatusCode(500, "An error occurred while retrieving the default address");
            }
        }
    }
}