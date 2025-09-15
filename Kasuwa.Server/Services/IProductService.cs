using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public interface IProductService
    {
        Task<ProductSearchResultDto> SearchProductsAsync(ProductSearchDto searchDto);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto, string vendorId);
        Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto updateProductDto, string vendorId);
        Task<bool> DeleteProductAsync(int id, string vendorId);
        Task<List<ProductListDto>> GetVendorProductsAsync(string vendorId);
        Task<bool> UpdateProductStockAsync(int productId, int stockQuantity);
        Task<List<ProductCategoryDto>> GetCategoriesAsync();
        Task<ProductCategoryDto?> GetCategoryByIdAsync(int id);
        Task<ProductCategoryDto> CreateCategoryAsync(CreateProductCategoryDto createCategoryDto);
        Task<ProductCategoryDto?> UpdateCategoryAsync(int id, UpdateProductCategoryDto updateCategoryDto);
        Task<bool> DeleteCategoryAsync(int id);
        Task<List<ProductImageDto>> UploadProductImagesAsync(int productId, List<IFormFile> images, string vendorId);
        Task<bool> DeleteProductImageAsync(int imageId, string vendorId);
        Task<bool> SetPrimaryImageAsync(int imageId, string vendorId);
    }
}