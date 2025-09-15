using Kasuwa.Server.DTOs;

namespace Kasuwa.Server.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto, string customerId);
        Task<OrderDto?> GetOrderByIdAsync(int id, string? userId = null);
        Task<OrderSearchResultDto> SearchOrdersAsync(OrderSearchDto searchDto, string? userId = null, bool isAdmin = false);
        Task<List<OrderListDto>> GetCustomerOrdersAsync(string customerId);
        Task<List<OrderListDto>> GetVendorOrdersAsync(string vendorId);
        Task<OrderDto?> UpdateOrderStatusAsync(int id, UpdateOrderStatusDto updateStatusDto, string userId);
        Task<bool> CancelOrderAsync(int id, CancelOrderDto cancelOrderDto, string userId);
        Task<OrderStatsDto> GetOrderStatsAsync(string? vendorId = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<bool> UpdateOrderTrackingAsync(int orderId, string trackingNumber, string location, string updatedBy);
        Task<List<OrderTrackingDto>> GetOrderTrackingAsync(int orderId);
    }
}