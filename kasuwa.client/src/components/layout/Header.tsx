import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, ShoppingCartIcon as CartSolid } from '@heroicons/react/24/solid';

interface HeaderProps {
  cartItemCount?: number;
  wishlistItemCount?: number;
  isAuthenticated?: boolean;
  user?: { firstName: string; lastName: string; };
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onAuthClick?: () => void;
}

export default function Header({ 
  cartItemCount = 0,
  wishlistItemCount = 0,
  isAuthenticated = false,
  user,
  onSearch,
  onCartClick,
  onWishlistClick,
  onAuthClick
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Vendors', href: '/vendors' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar - Northern Nigerian Cultural Greeting */}
      <div className="bg-gradient-to-r from-kasuwa-primary-600 to-kasuwa-secondary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="hidden md:flex items-center space-x-4">
              <span className="font-medium">Sannu da zuwa Kasuwa! 🇳🇬</span>
              <span className="text-kasuwa-accent-200">Welcome to Northern Nigeria's Premier Marketplace</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs">📞 Support: +234 800 KASUWA</span>
              <span className="text-xs">🚚 Free Delivery within Kano</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-kasuwa-primary-600 to-kasuwa-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold font-display text-kasuwa-primary-700">
                  Kasuwa
                </h1>
                <p className="text-xs text-gray-600 -mt-1">Marketplace na Arewa</p>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, vendors, categories..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-kasuwa-primary-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-kasuwa-primary-600 hover:text-kasuwa-primary-700"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Search button for mobile */}
            <button className="md:hidden p-2 text-gray-600 hover:text-kasuwa-primary-600">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Wishlist */}
            <button
              onClick={onWishlistClick}
              className="relative p-2 text-gray-600 hover:text-kasuwa-primary-600 transition-colors"
            >
              {wishlistItemCount > 0 ? (
                <HeartSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-kasuwa-primary-600 transition-colors"
            >
              {cartItemCount > 0 ? (
                <CartSolid className="h-6 w-6 text-kasuwa-primary-600" />
              ) : (
                <ShoppingCartIcon className="h-6 w-6" />
              )}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-kasuwa-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-kasuwa-primary-600 transition-colors"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.firstName}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-kasuwa-primary-600"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 pb-4 border-b border-gray-100">
          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-gray-700 hover:text-kasuwa-primary-600 font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Special Links */}
          <div className="ml-auto flex items-center space-x-6">
            <Link
              to="/become-vendor"
              className="text-kasuwa-secondary-600 hover:text-kasuwa-secondary-700 font-medium transition-colors"
            >
              Become a Vendor
            </Link>
            <Link
              to="/help"
              className="text-gray-600 hover:text-kasuwa-primary-600 transition-colors"
            >
              Help & Support
            </Link>
          </div>
        </nav>
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
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-kasuwa-primary-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-kasuwa-primary-600"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-gray-700 hover:text-kasuwa-primary-600 hover:bg-kasuwa-primary-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to="/become-vendor"
                  className="block px-3 py-2 text-kasuwa-secondary-600 hover:text-kasuwa-secondary-700 hover:bg-kasuwa-secondary-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Vendor
                </Link>
                <Link
                  to="/help"
                  className="block px-3 py-2 text-gray-600 hover:text-kasuwa-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help & Support
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}