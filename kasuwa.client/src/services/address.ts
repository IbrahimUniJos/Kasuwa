// Address management service for Kasuwa platform
import { apiClient, unwrapApiResponse } from './api';
import type { 
  AddressDto, 
  CreateAddressDto,
  UpdateAddressDto,
  ApiResponseDto 
} from '../types/api';

export class AddressService {
  /**
   * Get user's addresses
   */
  async getAddresses(): Promise<AddressDto[]> {
    const response = await apiClient.get<ApiResponseDto<AddressDto[]>>('/addresses');
    return unwrapApiResponse(response);
  }

  /**
   * Get address by ID
   */
  async getAddress(id: number): Promise<AddressDto> {
    const response = await apiClient.get<ApiResponseDto<AddressDto>>(`/addresses/${id}`);
    return unwrapApiResponse(response);
  }

  /**
   * Create new address
   */
  async createAddress(address: CreateAddressDto): Promise<AddressDto> {
    const response = await apiClient.post<ApiResponseDto<AddressDto>>('/addresses', address);
    return unwrapApiResponse(response);
  }

  /**
   * Update existing address
   */
  async updateAddress(id: number, address: UpdateAddressDto): Promise<AddressDto> {
    const response = await apiClient.put<ApiResponseDto<AddressDto>>(`/addresses/${id}`, address);
    return unwrapApiResponse(response);
  }

  /**
   * Delete address
   */
  async deleteAddress(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>(`/addresses/${id}`);
    unwrapApiResponse(response);
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id: number): Promise<AddressDto> {
    const response = await apiClient.put<ApiResponseDto<AddressDto>>(`/addresses/${id}/set-default`);
    return unwrapApiResponse(response);
  }

  /**
   * Get default address
   */
  async getDefaultAddress(): Promise<AddressDto | null> {
    try {
      const response = await apiClient.get<ApiResponseDto<AddressDto>>('/addresses/default');
      return unwrapApiResponse(response);
    } catch (error: any) {
      // Return null if no default address found (404 is expected)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

// Create and export default instance
export const addressService = new AddressService();