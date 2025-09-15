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
import { 
  productService, 
  categoryService, 
  authService, 
  cartService, 
  wishlistService 
} from './services';
import type { User, Product, Cart, ProductCategory } from './types';
import type { LoginDto, RegisterDto } from './types/api';

import './App.css';

// Helper mapping functions
const mapVendorDtoToUser = (vendorDto: any): User => ({
  id: vendorDto.id,
  firstName: vendorDto.firstName,
  lastName: vendorDto.lastName,
  email: vendorDto.email,
  phoneNumber: vendorDto.phoneNumber,
  isEmailConfirmed: true,
  profilePictureUrl: vendorDto.logoUrl,
  addresses: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

const mapProductDtoToProduct = (productDto: any): Product => ({
  id: productDto.id,
  vendorId: productDto.vendorId,
  name: productDto.name,
  description: productDto.description,
  price: productDto.price,
  stockQuantity: 0,
  sku: productDto.sku,
  isActive: productDto.isActive,
  createdDate: new Date(productDto.createdAt),
  updatedDate: new Date(productDto.createdAt),
  categoryId: productDto.categoryId,
  comparePrice: productDto.compareAtPrice,
  weight: 0,
  weightUnit: undefined,
  requiresShipping: true,
  trackQuantity: true,
  continueSellingWhenOutOfStock: false,
  metaTitle: undefined,
  metaDescription: undefined,
  quantity: 0,
  compareAtPrice: productDto.compareAtPrice,
  isFeatured: true,
  createdAt: new Date(productDto.createdAt),
  updatedAt: new Date(productDto.createdAt),
  seoTitle: undefined,
  seoDescription: undefined,
  category: productDto.category,
  vendor: mapVendorDtoToUser(productDto.vendor),
  images: productDto.images?.map((img: any) => ({
    id: img.id,
    productId: productDto.id,
    imageUrl: img.imageUrl,
    altText: img.altText,
    displayOrder: img.displayOrder,
    isMain: img.isMain
  })) || [],
  variants: productDto.variants || [],
  reviews: [],
  averageRating: productDto.averageRating,
  totalReviews: productDto.totalReviews
});

// Mapping function for ProductListDto (from search/list endpoints)
const mapProductListDtoToProduct = (productListDto: any): Product => ({
  id: productListDto.id,
  vendorId: '', // Not available in list view
  name: productListDto.name,
  description: '', // Not available in list view
  price: productListDto.price,
  stockQuantity: productListDto.stockQuantity,
  sku: productListDto.sku,
  isActive: productListDto.isActive,
  createdDate: new Date(productListDto.createdDate),
  updatedDate: new Date(productListDto.createdDate),
  categoryId: 0, // Not available, will be derived from categoryName
  comparePrice: productListDto.comparePrice,
  weight: 0,
  weightUnit: undefined,
  requiresShipping: true,
  trackQuantity: true,
  continueSellingWhenOutOfStock: false,
  metaTitle: undefined,
  metaDescription: undefined,
  quantity: productListDto.stockQuantity,
  compareAtPrice: productListDto.comparePrice,
  isFeatured: true,
  createdAt: new Date(productListDto.createdDate),
  updatedAt: new Date(productListDto.createdDate),
  seoTitle: undefined,
  seoDescription: undefined,
  category: {
    id: 0, // Will need to be resolved
    name: productListDto.categoryName,
    slug: productListDto.categoryName.toLowerCase().replace(/\s+/g, '-'),
    isActive: true,
    displayOrder: 0,
    subCategories: []
  },
  vendor: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: undefined,
    isEmailConfirmed: true,
    profilePictureUrl: undefined,
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  images: productListDto.primaryImageUrl ? [{
    id: 0,
    productId: productListDto.id,
    imageUrl: productListDto.primaryImageUrl,
    altText: productListDto.name,
    displayOrder: 1,
    isMain: true
  }] : [],
  variants: [],
  reviews: [],
  averageRating: productListDto.averageRating,
  totalReviews: productListDto.reviewCount
});

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
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.allSettled([
        productService.getProducts({ pageSize: 20 }), // Use general products endpoint
        categoryService.getCategories()
      ]);

      // Handle products response
      if (productsResponse.status === 'fulfilled') {
        const mappedProducts: Product[] = productsResponse.value.data.map(mapProductListDtoToProduct);
        setProducts(mappedProducts);
      } else {
        console.error('Failed to load products:', productsResponse.reason);
        setError('Failed to load products. Please try again.');
      }

      // Handle categories response
      if (categoriesResponse.status === 'fulfilled') {
        setCategories(categoriesResponse.value);
      } else {
        console.error('Failed to load categories:', categoriesResponse.reason);
        // Categories failure is not critical, so we don't set error state
      }

      // Check if user is already authenticated
      const token = localStorage.getItem('kasuwa_auth_token');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          // Map UserDto to User interface
          const mappedUser: User = {
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            isEmailConfirmed: currentUser.isEmailConfirmed,
            profilePictureUrl: currentUser.profilePictureUrl,
            addresses: [], // Will be loaded separately if needed
            createdAt: new Date(currentUser.createdAt),
            updatedAt: new Date(currentUser.createdAt)
          };
          setUser(mappedUser);

          // Load user's cart and wishlist
          await Promise.allSettled([
            loadUserCart(),
            loadUserWishlist()
          ]);
        } catch (authError) {
          console.error('Authentication check failed:', authError);
          // Clear invalid token
          localStorage.removeItem('kasuwa_auth_token');
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError('Failed to load application data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCart = async () => {
    try {
      const cartDto = await cartService.getCart();
      // Map CartDto to Cart interface
      const mappedCart: Cart = {
        id: cartDto.id,
        userId: cartDto.userId,
        createdAt: new Date(cartDto.createdAt),
        updatedAt: new Date(cartDto.createdAt), // Use createdAt as fallback
        items: cartDto.items?.map(itemDto => ({
          id: itemDto.id,
          cartId: cartDto.id, // Map from parent cart
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice: itemDto.totalPrice,
          productVariant: itemDto.productVariant,
          createdAt: new Date(cartDto.createdAt), // Use cart createdAt as fallback
          product: mapProductDtoToProduct(itemDto.product)
        })) || [],
        totalItems: cartDto.totalItems,
        totalAmount: cartDto.totalAmount
      };
      setCart(mappedCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Cart failure is not critical for initial load
    }
  };

  const loadUserWishlist = async () => {
    try {
      const wishlistDto = await wishlistService.getWishlist();
      const wishlistIds = new Set(
        wishlistDto.items?.map(item => item.productId) || []
      );
      setWishlistProductIds(wishlistIds);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      // Wishlist failure is not critical for initial load
    }
  };

  // Authentication Handlers
  const handleLogin = async (credentials: LoginDto) => {
    try {
      const authResponse = await authService.login(credentials);
      
      // Map UserDto to User interface
      const mappedUser: User = {
        id: authResponse.user.id,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        email: authResponse.user.email,
        phoneNumber: authResponse.user.phoneNumber,
        isEmailConfirmed: authResponse.user.isEmailConfirmed,
        profilePictureUrl: authResponse.user.profilePictureUrl,
        addresses: [], // Will be loaded separately if needed
        createdAt: new Date(authResponse.user.createdAt),
        updatedAt: new Date(authResponse.user.createdAt)
      };
      
      setUser(mappedUser);
      setShowAuthModal(false);
      
      // Load user's cart and wishlist after successful login
      await Promise.allSettled([
        loadUserCart(),
        loadUserWishlist()
      ]);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterDto) => {
    try {
      const authResponse = await authService.register(userData);
      
      // Map UserDto to User interface
      const mappedUser: User = {
        id: authResponse.user.id,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        email: authResponse.user.email,
        phoneNumber: authResponse.user.phoneNumber,
        isEmailConfirmed: authResponse.user.isEmailConfirmed,
        profilePictureUrl: authResponse.user.profilePictureUrl,
        addresses: [], // Will be loaded separately if needed
        createdAt: new Date(authResponse.user.createdAt),
        updatedAt: new Date(authResponse.user.createdAt)
      };
      
      setUser(mappedUser);
      setShowAuthModal(false);
      
      // Initialize cart and wishlist for new user
      await Promise.allSettled([
        loadUserCart(),
        loadUserWishlist()
      ]);
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

    try {
      const updatedCart = await cartService.addToCart({
        productId,
        quantity: 1
      });
      
      // Map the updated cart
      const mappedCart: Cart = {
        id: updatedCart.id,
        userId: updatedCart.userId,
        createdAt: new Date(updatedCart.createdAt),
        updatedAt: new Date(updatedCart.createdAt),
        items: updatedCart.items?.map(itemDto => ({
          id: itemDto.id,
          cartId: updatedCart.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice: itemDto.totalPrice,
          productVariant: itemDto.productVariant,
          createdAt: new Date(updatedCart.createdAt),
          product: mapProductDtoToProduct(itemDto.product)
        })) || [],
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount
      };
      
      setCart(mappedCart);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // TODO: Show error toast to user
    }
  };

  const handleUpdateCartQuantity = async (itemId: number, quantity: number) => {
    if (!user) return;

    try {
      const updatedCart = await cartService.updateCartItem({
        cartItemId: itemId,
        quantity
      });
      
      // Map the updated cart (same as above)
      const mappedCart: Cart = {
        id: updatedCart.id,
        userId: updatedCart.userId,
        createdAt: new Date(updatedCart.createdAt),
        updatedAt: new Date(updatedCart.createdAt),
        items: updatedCart.items?.map(itemDto => ({
          id: itemDto.id,
          cartId: updatedCart.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice: itemDto.totalPrice,
          productVariant: itemDto.productVariant,
          createdAt: new Date(updatedCart.createdAt),
          product: mapProductDtoToProduct(itemDto.product)
        })) || [],
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount
      };
      
      setCart(mappedCart);
    } catch (error) {
      console.error('Failed to update cart item:', error);
      // TODO: Show error toast to user
    }
  };

  const handleRemoveFromCart = async (itemId: number) => {
    if (!user) return;

    try {
      const updatedCart = await cartService.removeFromCart(itemId);
      
      // Map the updated cart (same as above)
      const mappedCart: Cart = {
        id: updatedCart.id,
        userId: updatedCart.userId,
        createdAt: new Date(updatedCart.createdAt),
        updatedAt: new Date(updatedCart.createdAt),
        items: updatedCart.items?.map(itemDto => ({
          id: itemDto.id,
          cartId: updatedCart.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice: itemDto.totalPrice,
          productVariant: itemDto.productVariant,
          createdAt: new Date(updatedCart.createdAt),
          product: mapProductDtoToProduct(itemDto.product)
        })) || [],
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount
      };
      
      setCart(mappedCart);
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      // TODO: Show error toast to user
    }
  };

  // Other handlers
  const handleToggleWishlist = async (productId: number) => {
    if (!user) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const isInWishlist = wishlistProductIds.has(productId);
      
      if (isInWishlist) {
        // Find the wishlist item to remove
        const wishlistDto = await wishlistService.getWishlist();
        const itemToRemove = wishlistDto.items?.find(item => item.productId === productId);
        
        if (itemToRemove) {
          await wishlistService.removeFromWishlist(itemToRemove.id);
          const newWishlistIds = new Set(wishlistProductIds);
          newWishlistIds.delete(productId);
          setWishlistProductIds(newWishlistIds);
        }
      } else {
        await wishlistService.addToWishlist({ productId });
        const newWishlistIds = new Set(wishlistProductIds);
        newWishlistIds.add(productId);
        setWishlistProductIds(newWishlistIds);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      // TODO: Show error toast to user
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadInitialData();
            }}
            className="bg-kasuwa-primary-600 text-white px-6 py-2 rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
          >
            Try Again
          </button>
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