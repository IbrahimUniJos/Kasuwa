using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            ITokenService tokenService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = "User with this email already exists."
                    });
                }

                // Create new user
                var user = new ApplicationUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    UserType = request.UserType,
                    BusinessName = request.BusinessName,
                    BusinessDescription = request.BusinessDescription,
                    BusinessAddress = request.BusinessAddress,
                    BusinessPhone = request.BusinessPhone,
                    DateOfBirth = request.DateOfBirth,
                    PreferredLanguage = request.PreferredLanguage,
                    EmailConfirmed = true // Set to false in production and implement email confirmation
                };

                var result = await _userManager.CreateAsync(user, request.Password);

                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }

                // Assign role based on user type
                string roleName = request.UserType switch
                {
                    UserType.Customer => "Customer",
                    UserType.Vendor => "Vendor",
                    UserType.Administrator => "Administrator",
                    _ => "Customer"
                };

                await _userManager.AddToRoleAsync(user, roleName);

                // For vendors, set approval status to false (admin needs to approve)
                if (request.UserType == UserType.Vendor)
                {
                    user.IsVendorApproved = false;
                    await _userManager.UpdateAsync(user);
                }

                // Generate JWT token
                var token = await _tokenService.GenerateJwtTokenAsync(user);
                var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

                var userDto = await CreateUserDto(user);

                _logger.LogInformation("User {Email} registered successfully", request.Email);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Registration successful",
                    Token = token,
                    RefreshToken = refreshToken.Token,
                    TokenExpiration = DateTime.UtcNow.AddHours(3),
                    User = userDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        /// <summary>
        /// Login user
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                if (!user.IsActive)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        Success = false,
                        Message = "Account is deactivated. Please contact support."
                    });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

                if (!result.Succeeded)
                {
                    if (result.IsLockedOut)
                    {
                        return Unauthorized(new AuthResponseDto
                        {
                            Success = false,
                            Message = "Account is locked out. Please try again later."
                        });
                    }

                    return Unauthorized(new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                // Update last login
                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                // Generate tokens
                var token = await _tokenService.GenerateJwtTokenAsync(user);
                var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

                var userDto = await CreateUserDto(user);

                _logger.LogInformation("User {Email} logged in successfully", request.Email);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    RefreshToken = refreshToken.Token,
                    TokenExpiration = DateTime.UtcNow.AddHours(3),
                    User = userDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        /// <summary>
        /// Refresh JWT token
        /// </summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                // Validate the refresh token
                var isValidRefreshToken = await _tokenService.ValidateRefreshTokenAsync(request.RefreshToken);
                if (!isValidRefreshToken)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid or expired refresh token"
                    });
                }

                // Get the refresh token details
                var refreshTokenEntity = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);
                if (refreshTokenEntity == null || refreshTokenEntity.User == null)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid refresh token"
                    });
                }

                var user = refreshTokenEntity.User;
                if (!user.IsActive)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        Success = false,
                        Message = "User account is deactivated"
                    });
                }

                // Revoke the old refresh token
                await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, "Replaced by new token");

                // Generate new tokens
                var newToken = await _tokenService.GenerateJwtTokenAsync(user);
                var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Token refreshed successfully",
                    Token = newToken,
                    RefreshToken = newRefreshToken.Token,
                    TokenExpiration = DateTime.UtcNow.AddHours(3)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid token"
                });
            }
        }

        /// <summary>
        /// Logout user (client-side token removal)
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> Logout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation("User {UserId} logged out", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Logout successful"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during logout"
                });
            }
        }

        /// <summary>
        /// Logout from all devices (revoke all refresh tokens)
        /// </summary>
        [HttpPost("logout-all")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> LogoutAll()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Revoke all refresh tokens for the user
                await _tokenService.RevokeAllRefreshTokensAsync(userId, "User requested logout from all devices");

                _logger.LogInformation("User {UserId} logged out from all devices", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Logged out from all devices successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout all");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during logout"
                });
            }
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
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
                    return NotFound();
                }

                var userDto = await CreateUserDto(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, "An error occurred while getting user profile");
            }
        }

        /// <summary>
        /// Change user password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> ChangePassword([FromBody] ChangePasswordRequestDto request)
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
                    return NotFound();
                }

                var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }

                _logger.LogInformation("User {UserId} changed password successfully", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Password changed successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while changing password"
                });
            }
        }

        /// <summary>
        /// Request password reset token
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<ActionResult<AuthResponseDto>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null || !user.IsActive)
                {
                    // Don't reveal that the user does not exist or is inactive
                    // This prevents email enumeration attacks
                    return Ok(new AuthResponseDto 
                    { 
                        Success = true, 
                        Message = "Password reset link sent if email exists and account is active" 
                    });
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                
                // In production, you would send an email with the reset link
                // For now, we'll log the token for testing purposes
                _logger.LogInformation("Password reset token for {Email}: {Token}", request.Email, token);
                
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Password reset link sent to your email if the account exists"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset request");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while processing password reset request"
                });
            }
        }

        /// <summary>
        /// Reset password using token
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<ActionResult<AuthResponseDto>> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    return BadRequest(new AuthResponseDto 
                    { 
                        Success = false, 
                        Message = "Invalid reset request" 
                    });
                }

                if (!user.IsActive)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = "Account is deactivated. Please contact support."
                    });
                }

                var result = await _userManager.ResetPasswordAsync(user, request.Token, request.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }

                // Update security stamp to invalidate existing tokens
                await _userManager.UpdateSecurityStampAsync(user);

                _logger.LogInformation("Password reset successfully for user {Email}", request.Email);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Password reset successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while resetting password"
                });
            }
        }

        private async Task<UserDto> CreateUserDto(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
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
        }
    }
}