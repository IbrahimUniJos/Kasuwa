using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public class UserAddressService : IUserAddressService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserAddressService> _logger;

        public UserAddressService(ApplicationDbContext context, ILogger<UserAddressService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<UserAddressDto>> GetUserAddressesAsync(string userId)
        {
            var addresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.DateCreated)
                .ToListAsync();

            return addresses.Select(MapToDto).ToList();
        }

        public async Task<UserAddressDto?> GetAddressByIdAsync(int addressId, string userId)
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            return address != null ? MapToDto(address) : null;
        }

        public async Task<UserAddressDto?> GetDefaultAddressAsync(string userId)
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault);

            return address != null ? MapToDto(address) : null;
        }

        public async Task<UserAddressDto> CreateAddressAsync(CreateUserAddressDto createAddressDto, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // If this is set as default, unset other default addresses
                if (createAddressDto.IsDefault)
                {
                    await UnsetOtherDefaultAddressesAsync(userId);
                }

                // If this is the user's first address, make it default
                var hasExistingAddresses = await _context.UserAddresses
                    .AnyAsync(a => a.UserId == userId);
                
                if (!hasExistingAddresses)
                {
                    createAddressDto.IsDefault = true;
                }

                var address = new UserAddress
                {
                    UserId = userId,
                    AddressLine1 = createAddressDto.AddressLine1,
                    AddressLine2 = createAddressDto.AddressLine2,
                    City = createAddressDto.City,
                    State = createAddressDto.State,
                    PostalCode = createAddressDto.PostalCode ?? "",
                    Country = createAddressDto.Country,
                    IsDefault = createAddressDto.IsDefault,
                    DateCreated = DateTime.UtcNow
                };

                _context.UserAddresses.Add(address);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Created address {AddressId} for user {UserId}", address.Id, userId);

                return MapToDto(address);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating address for user {UserId}", userId);
                throw;
            }
        }

        public async Task<UserAddressDto?> UpdateAddressAsync(int addressId, UpdateUserAddressDto updateAddressDto, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var address = await _context.UserAddresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                {
                    return null;
                }

                // If this is being set as default, unset other default addresses
                if (updateAddressDto.IsDefault && !address.IsDefault)
                {
                    await UnsetOtherDefaultAddressesAsync(userId);
                }

                // Update address fields
                address.AddressLine1 = updateAddressDto.AddressLine1;
                address.AddressLine2 = updateAddressDto.AddressLine2;
                address.City = updateAddressDto.City;
                address.State = updateAddressDto.State;
                address.PostalCode = updateAddressDto.PostalCode ?? "";
                address.Country = updateAddressDto.Country;
                address.IsDefault = updateAddressDto.IsDefault;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Updated address {AddressId} for user {UserId}", addressId, userId);

                return MapToDto(address);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error updating address {AddressId} for user {UserId}", addressId, userId);
                throw;
            }
        }

        public async Task<bool> DeleteAddressAsync(int addressId, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var address = await _context.UserAddresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                {
                    return false;
                }

                // Check if this address is being used in any orders
                var isUsedInOrders = await _context.Orders
                    .AnyAsync(o => o.ShippingAddress.Contains(address.AddressLine1) && 
                                  o.CustomerId == userId);

                if (isUsedInOrders)
                {
                    throw new InvalidOperationException("Cannot delete address that has been used in orders");
                }

                var wasDefault = address.IsDefault;
                _context.UserAddresses.Remove(address);
                await _context.SaveChangesAsync();

                // If the deleted address was default, set another address as default
                if (wasDefault)
                {
                    var nextAddress = await _context.UserAddresses
                        .Where(a => a.UserId == userId)
                        .OrderByDescending(a => a.DateCreated)
                        .FirstOrDefaultAsync();

                    if (nextAddress != null)
                    {
                        nextAddress.IsDefault = true;
                        await _context.SaveChangesAsync();
                    }
                }

                await transaction.CommitAsync();

                _logger.LogInformation("Deleted address {AddressId} for user {UserId}", addressId, userId);

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting address {AddressId} for user {UserId}", addressId, userId);
                throw;
            }
        }

        public async Task<UserAddressDto?> SetDefaultAddressAsync(int addressId, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var address = await _context.UserAddresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                {
                    return null;
                }

                // Unset other default addresses
                await UnsetOtherDefaultAddressesAsync(userId);

                // Set this address as default
                address.IsDefault = true;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Set address {AddressId} as default for user {UserId}", addressId, userId);

                return MapToDto(address);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error setting default address {AddressId} for user {UserId}", addressId, userId);
                throw;
            }
        }

        private async Task UnsetOtherDefaultAddressesAsync(string userId)
        {
            var defaultAddresses = await _context.UserAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();

            foreach (var address in defaultAddresses)
            {
                address.IsDefault = false;
            }
        }

        private static UserAddressDto MapToDto(UserAddress address)
        {
            return new UserAddressDto
            {
                Id = address.Id,
                UserId = address.UserId,
                AddressLine1 = address.AddressLine1,
                AddressLine2 = address.AddressLine2,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country,
                IsDefault = address.IsDefault,
                CreatedDate = address.DateCreated,
                UpdatedDate = address.DateCreated // Use DateCreated for both since model doesn't have UpdatedDate
            };
        }
    }
}