import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  HeartIcon, 
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { CategoryService } from '../../services/products';
import { useAuth } from '../../contexts/AuthContext';
import type { CategoryDto } from '../../types/api';

interface HeaderProps {
  cartItemCount?: number;
  wishlistItemCount?: number;
  isAuthenticated?: boolean;
  user?: { firstName: string; lastName: string; };
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onAuthClick?: () => void;
  onLogout?: () => void;
}

export default function Header({ 
  cartItemCount = 0,
  wishlistItemCount = 0,
  isAuthenticated = false,
  user,
  onSearch,
  onCartClick,
  onWishlistClick,
  onAuthClick,
  onLogout
}: HeaderProps) {
  const navigate = useNavigate();
  const { isAdmin, isVendor } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryService = new CategoryService();
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData.slice(0, 12)); // Limit to first 12 categories for dropdown
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false); // Close mobile menu if open
      
      // Also call the onSearch callback if provided
      onSearch?.(searchQuery.trim());
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            {/* Left side - Welcome message */}
            <div className="hidden md:flex items-center space-x-4 text-gray-600">
              <span>📱 Download the Kasuwa app</span>
              <span>🚚 Free shipping</span>
            </div>
            
            {/* Right side - Language and Auth */}
            <div className="flex items-center space-x-4">
              {/* Language/Region Selector */}
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 cursor-pointer">
                <GlobeAltIcon className="h-4 w-4" />
                <span>EN / NGN</span>
                <ChevronDownIcon className="h-3 w-3" />
              </div>
              
              {/* Authentication */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  >
                    <span>Welcome {user.firstName}</span>
                    <ChevronDownIcon className="h-3 w-3" />
                  </button>
                  
                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>
                        My Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>
                        Wishlist
                      </Link>
                      
                      {/* Admin/Vendor Links */}
                      {isAdmin && (
                        <div className="border-t border-gray-100 my-1">
                          <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}>
                            <CogIcon className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </div>
                      )}
                      
                      {isVendor && (
                        <div className="border-t border-gray-100 my-1">
                          <Link to="/vendor/dashboard" className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50" onClick={() => setIsUserMenuOpen(false)}>
                            <CogIcon className="h-4 w-4 mr-2" />
                            Vendor Dashboard
                          </Link>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button onClick={onAuthClick} className="text-gray-600 hover:text-gray-800">
                    Sign in
                  </button>
                  <span className="text-gray-400">|</span>
                  <Link to="/register" className="text-gray-600 hover:text-gray-800">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-4 space-x-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-2xl font-bold text-orange-500 hidden sm:block">Kasuwa</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-4 pr-20 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-6">
            {/* Wishlist - Hidden on mobile */}
            <button
              onClick={onWishlistClick}
              className="hidden md:flex flex-col items-center p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              {wishlistItemCount > 0 ? (
                <HeartSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative flex flex-col items-center p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <div className="relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 hidden md:block">Cart</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-orange-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center space-x-8 py-3">
            {/* Categories Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-medium"
              >
                <Bars3Icon className="h-4 w-4" />
                <span>All Categories</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {/* Categories Dropdown Menu */}
              {isCategoriesOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="group">
                      <Link
                        to={`/products?category=${category.id}`}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <span>{category.name}</span>
                        {category.subCategories && category.subCategories.length > 0 && (
                          <ChevronDownIcon className="h-3 w-3 -rotate-90" />
                        )}
                      </Link>
                      
                      {/* Subcategories */}
                      {category.subCategories && category.subCategories.length > 0 && (
                        <div className="ml-4 border-l border-gray-200">
                          {category.subCategories.slice(0, 5).map((subCategory) => (
                            <Link
                              key={subCategory.id}
                              to={`/products?category=${subCategory.id}`}
                              className="block px-4 py-1 text-xs text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              {subCategory.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* View All Categories */}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Links */}
            <Link to="/bundle-deals" className="text-red-500 font-medium hover:text-red-600">
              Bundle deals
            </Link>
            <Link to="/choice" className="text-gray-700 hover:text-orange-500 font-medium">
              Choice
            </Link>
            <Link to="/business" className="text-gray-700 hover:text-orange-500 font-medium">
              Kasuwa Business
            </Link>
            <Link to="/super-deals" className="text-gray-700 hover:text-orange-500 font-medium">
              SuperDeals
            </Link>
            <Link to="/home-garden" className="text-gray-700 hover:text-orange-500 font-medium">
              Home & Garden
            </Link>
            <Link to="/electronics" className="text-gray-700 hover:text-orange-500 font-medium">
              Electronics
            </Link>
            
            {/* More dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-medium"
              >
                <span>More</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {/* More Dropdown Menu */}
              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/fashion"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Fashion
                  </Link>
                  <Link
                    to="/sports"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Sports & Outdoors
                  </Link>
                  <Link
                    to="/health-beauty"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Health & Beauty
                  </Link>
                  <Link
                    to="/toys"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Toys & Games
                  </Link>
                  <Link
                    to="/automotive"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Automotive
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    to="/become-vendor"
                    className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Become a Vendor
                  </Link>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-orange-50"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    Help & Support
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-20 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              <Link to="/bundle-deals" className="block px-3 py-2 text-red-500 font-medium rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Bundle deals
              </Link>
              <Link to="/choice" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Choice
              </Link>
              <Link to="/business" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Kasuwa Business
              </Link>
              <Link to="/super-deals" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                SuperDeals
              </Link>
              <Link to="/home-garden" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Home & Garden
              </Link>
              <Link to="/electronics" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Electronics
              </Link>
              
              {/* User Menu Items for Mobile */}
              {isAuthenticated && user ? (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-900">
                    Welcome, {user.firstName}!
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  
                  {/* Admin/Vendor Links for Mobile */}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CogIcon className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  {isVendor && (
                    <Link
                      to="/vendor/dashboard"
                      className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CogIcon className="h-4 w-4 mr-2" />
                      Vendor Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onAuthClick?.();
                    }}
                    className="w-full px-3 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 font-medium"
                  >
                    Sign In
                  </button>
                  <Link
                    to="/register"
                    className="block w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to="/become-vendor"
                  className="block px-3 py-2 text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Vendor
                </Link>
                <Link
                  to="/help"
                  className="block px-3 py-2 text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help & Support
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
      
      {/* Click outside to close categories dropdown */}
      {isCategoriesOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsCategoriesOpen(false)}
        />
      )}
      
      {/* Click outside to close more menu */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </header>
  );
}