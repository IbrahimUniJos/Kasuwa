import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import CategoryBrowse from '../components/categories/CategoryBrowse';
import { productService } from '../services/products';
import { cartService } from '../services/cart';
import type { ProductListDto } from '../types/api';
import AuthModal from '../components/ui/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import type { LoginDto, RegisterDto } from '../types/api';

interface HomePageProps {
  className?: string;
}

export default function HomePage({ className = '' }: HomePageProps) {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await productService.getFeaturedProducts(8);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError('Could not load featured products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartShopping = () => {
    navigate('/products');
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      // Show auth modal if user is not logged in
      setAuthOpen(true);
      return;
    }

    try {
      await cartService.addToCart({
        productId: productId,
        quantity: 1,
        productVariant: undefined // For now, no variant selection
      });
      
      // Show success message
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      // Show auth modal if user is not logged in
      setAuthOpen(true);
      return;
    }

    // TODO: Integrate with wishlist functionality
    console.log('Toggle wishlist:', productId);
    alert('Added to wishlist! (Feature coming soon)');
  };

  const handleQuickView = (productId: number) => {
    // Navigate to product detail page for now
    navigate(`/products/${productId}`);
  };

  const handleLogin = async (credentials: LoginDto) => {
    try {
      await login(credentials);
      setAuthOpen(false);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterDto) => {
    try {
      await register(userData);
      setAuthOpen(false);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="bg-gradient-to-r from-kasuwa-primary-600 to-kasuwa-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 id="hero-heading" className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Welcome to Kasuwa
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Discover authentic Northern Nigerian products from verified vendors. 
              From traditional crafts to modern goods, find everything you need in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleStartShopping}
                className="bg-white text-kasuwa-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-kasuwa-primary-700"
                aria-label="Start shopping: browse products"
              >
                Start Shopping
              </button>
              <button
                onClick={() => setAuthOpen(true)}
                className="bg-transparent border border-white/70 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-kasuwa-primary-700"
                aria-label="Become a vendor: open registration"
              >
                Become a Vendor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section aria-labelledby="featured-heading" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="featured-heading" className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="mt-4 text-lg text-gray-600">
              Handpicked items from our trusted vendors
            </p>
          </div>
          {error && (
            <div className="mb-6 mx-auto max-w-xl text-center" role="status" aria-live="polite">
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 inline-block">
                {error}
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="h-4 w-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={handleQuickView}
                    className="h-full"
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <button
                  onClick={handleViewAllProducts}
                  className="inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-medium"
                >
                  View All Products
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No featured products available at the moment.</p>
              <button
                onClick={handleViewAllProducts}
                className="mt-4 inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-medium"
              >
                Browse All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section aria-labelledby="categories-heading" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="categories-heading" className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-4 text-lg text-gray-600">
              Browse our organized collection of Northern Nigerian products
            </p>
          </div>
          
          <CategoryBrowse />
        </div>
      </section>

      {/* Trust & Benefits Section */}
      <section aria-labelledby="trust-heading" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-kasuwa-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Verified Vendors</h3>
                <p className="text-sm text-gray-600">Carefully vetted quality</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-kasuwa-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Local Heritage</h3>
                <p className="text-sm text-gray-600">Authentic Northern Nigerian</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-kasuwa-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🚚</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Quick & reliable shipping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-kasuwa-primary-600 to-kasuwa-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Join the Kasuwa Community</h2>
          <p className="text-lg mb-6 opacity-90">
            Discover authentic products from verified Northern Nigerian vendors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleViewAllProducts}
              className="bg-white text-kasuwa-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Explore Products
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="bg-transparent border border-white/70 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Start Selling
            </button>
          </div>
        </div>
      </section>

      {/* Auth Modal for Vendor onboarding */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        defaultTab="register"
        defaultUserType={2} // UserType.Vendor
      />
    </div>
  );
}