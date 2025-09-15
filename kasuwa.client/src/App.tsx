import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import Footer from './components/layout/Footer';

// Product Components
import FeaturedProducts from './components/products/FeaturedProducts';
import CategorySection from './components/products/CategorySection';

// UI Components
import AuthModal from './components/ui/AuthModal';
import CartDrawer from './components/ui/CartDrawer';

// Services and Types
import type { User, Product, Cart, ProductCategory } from './types';
import type { LoginDto, RegisterDto } from './types/api';

import './App.css';

function App() {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  
  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // For demo purposes, we'll create mock data since API might not be available
      // In production, these would call the actual API endpoints
      const mockProducts: Product[] = [
        {
          id: 1,
          name: "Traditional Hausa Embroidered Gown",
          description: "Beautiful handcrafted traditional gown with intricate embroidery",
          sku: "THG001",
          price: 15000,
          compareAtPrice: 20000,
          trackQuantity: true,
          quantity: 50,
          categoryId: 1,
          vendorId: "vendor1",
          isActive: true,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: 1, name: "Traditional Textiles", slug: "traditional-textiles", isActive: true, displayOrder: 1, subCategories: [] },
          vendor: { id: "vendor1", firstName: "Amina", lastName: "Ibrahim", email: "amina@example.com", isEmailConfirmed: true, addresses: [], createdAt: new Date(), updatedAt: new Date() },
          images: [{ id: 1, productId: 1, imageUrl: "/api/placeholder/400/400", displayOrder: 1, isMain: true }],
          variants: [],
          reviews: [],
          averageRating: 4.8,
          totalReviews: 24
        }
      ];

      const mockCategories: ProductCategory[] = [
        { id: 1, name: "Traditional Textiles", slug: "traditional-textiles", isActive: true, displayOrder: 1, subCategories: [] },
        { id: 2, name: "Handcrafted Jewelry", slug: "handcrafted-jewelry", isActive: true, displayOrder: 2, subCategories: [] }
      ];
      
      setProducts(mockProducts);
      setCategories(mockCategories);

      // Check if user is already authenticated
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // In production, verify token with backend
          console.log('User token found, would verify with backend');
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Authentication Handlers
  const handleLogin = async (credentials: LoginDto) => {
    try {
      console.log('Login attempt:', credentials);
      // Mock successful login
      const mockUser: User = {
        id: "user1",
        firstName: "John",
        lastName: "Doe",
        email: credentials.email,
        isEmailConfirmed: true,
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUser(mockUser);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterDto) => {
    try {
      console.log('Register attempt:', userData);
      // Mock successful registration
      const mockUser: User = {
        id: "user1",
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        isEmailConfirmed: true,
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUser(mockUser);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Cart Handlers
  const handleAddToCart = async (productId: number) => {
    if (!user) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    console.log('Add to cart:', productId);
    // Mock cart update
    setCart(prev => ({
      id: 1,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      totalItems: (prev?.totalItems || 0) + 1,
      totalAmount: (prev?.totalAmount || 0) + 15000
    }));
  };

  const handleUpdateCartQuantity = async (itemId: number, quantity: number) => {
    console.log('Update cart quantity:', itemId, quantity);
  };

  const handleRemoveFromCart = async (itemId: number) => {
    console.log('Remove from cart:', itemId);
  };

  // Other handlers
  const handleToggleWishlist = async (productId: number) => {
    if (!user) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    const newWishlistIds = new Set(wishlistProductIds);
    if (wishlistProductIds.has(productId)) {
      newWishlistIds.delete(productId);
    } else {
      newWishlistIds.add(productId);
    }
    setWishlistProductIds(newWishlistIds);
  };

  const handleExploreProducts = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBecomeVendor = () => {
    if (!user) {
      setAuthModalTab('register');
      setShowAuthModal(true);
    } else {
      console.log('Navigate to vendor registration');
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    console.log('Navigate to category:', categoryId);
  };

  const handleQuickView = (productId: number) => {
    console.log('Quick view product:', productId);
  };

  const handleCheckout = () => {
    console.log('Navigate to checkout');
    setShowCartDrawer(false);
  };

  const handleSearch = (query: string) => {
    console.log('Search for:', query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <div className="w-8 h-8 border-2 border-kasuwa-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kasuwa marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header
          user={user || undefined}
          cartItemCount={cart?.totalItems || 0}
          isAuthenticated={!!user}
          onSearch={handleSearch}
          onCartClick={() => setShowCartDrawer(true)}
          onAuthClick={() => {
            setAuthModalTab('login');
            setShowAuthModal(true);
          }}
        />

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={
              <>
                {/* Hero Section */}
                <Hero
                  onExploreProducts={handleExploreProducts}
                  onBecomeVendor={handleBecomeVendor}
                />

                {/* Featured Products */}
                <FeaturedProducts
                  products={products}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={handleQuickView}
                  wishlistProductIds={wishlistProductIds}
                />

                {/* Categories Section */}
                <div id="categories">
                  <CategorySection
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>

                {/* Trust and Support Section */}
                <section className="py-16 bg-gradient-to-br from-kasuwa-accent-50 to-kasuwa-primary-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                      Why Choose Kasuwa?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">✅</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Verified Vendors</h3>
                        <p className="text-gray-600">
                          All our vendors go through a thorough verification process to ensure quality and authenticity.
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🛡️</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Buyer Protection</h3>
                        <p className="text-gray-600">
                          Shop with confidence knowing your purchases are protected with our buyer guarantee.
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🚚</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Fast Delivery</h3>
                        <p className="text-gray-600">
                          Free delivery within Kano and express shipping to major cities across Northern Nigeria.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            } />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Modals and Drawers */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          defaultTab={authModalTab}
        />

        <CartDrawer
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      </div>
    </Router>
  );
}

export default App;