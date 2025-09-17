using Kasuwa.Server.DTOs;

namespace Kasuwa.Server.Services
{
    public interface IUserAddressService
    {
        Task<List<UserAddressDto>> GetUserAddressesAsync(string userId);
        Task<UserAddressDto?> GetAddressByIdAsync(int addressId, string userId);
        Task<UserAddressDto?> GetDefaultAddressAsync(string userId);
        Task<UserAddressDto> CreateAddressAsync(CreateUserAddressDto createAddressDto, string userId);
        Task<UserAddressDto?> UpdateAddressAsync(int addressId, UpdateUserAddressDto updateAddressDto, string userId);
        Task<bool> DeleteAddressAsync(int addressId, string userId);
        Task<UserAddressDto?> SetDefaultAddressAsync(int addressId, string userId);
    }
}