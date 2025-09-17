import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// UI Components
import AuthModal from './components/ui/AuthModal';
import CartDrawer from './components/ui/CartDrawer';

// Page Components
import { HomePage } from './components';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import RegistrationPage from './pages/RegistrationPage';
import VendorDashboardPage from './pages/VendorDashboardPage';

// Services and Types
import { 
  productService, 
  categoryService, 
  authService, 
  cartService, 
  wishlistService 
} from './services';
import type { User, Product, Cart, ProductCategory } from './types';
import type { LoginDto, RegisterDto, UserType, CartDto, CartItemDto } from './types/api';

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

// Helper function to map UserDto to User
const mapUserDtoToUser = (userDto: any): User => ({
  id: userDto.id,
  firstName: userDto.firstName,
  lastName: userDto.lastName,
  email: userDto.email,
  phoneNumber: userDto.phoneNumber,
  isEmailConfirmed: userDto.isEmailConfirmed || false,
  profilePictureUrl: userDto.profileImageUrl,
  addresses: [], // Will be loaded separately if needed
  createdAt: new Date(userDto.dateCreated),
  updatedAt: new Date(userDto.dateCreated)
});

function AppContent() {
  const navigate = useNavigate();
  
  // State Management
  const [user, setUser] = useState<any | null>(null); // Change to any to handle UserDto from backend
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  
  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalUserType, setAuthModalUserType] = useState<UserType>(1); // Default to Customer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication service on app startup
  useEffect(() => {
    authService.initialize();
    authService.setupTokenRefresh();
    loadInitialData();
  }, []); // Remove user dependency to prevent infinite loop

  // Separate effect to listen for cart updates
  useEffect(() => {
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      if (user) {
        loadUserCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]); // Keep user dependency only for the event listener

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
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          const mappedUser = mapUserDtoToUser(currentUser);
          setUser(mappedUser);

          // Load user's cart and wishlist
          await Promise.allSettled([
            loadUserCart(),
            loadUserWishlist()
          ]);
        } catch (authError) {
          console.error('Authentication check failed:', authError);
          // Clear invalid tokens
          await authService.logout();
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
      setCart(mapCartDtoToCart(cartDto));
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
      
      if (authResponse.success && authResponse.user) {
        const mappedUser = mapUserDtoToUser(authResponse.user);
        setUser(mappedUser);
        setShowAuthModal(false);
        
        // Load user's cart and wishlist after successful login
        await Promise.allSettled([
          loadUserCart(),
          loadUserWishlist()
        ]);

        // Navigate based on user type
        if (authResponse.user.userType === 2) { // UserType.Vendor
          navigate('/vendor/dashboard');
        } else if (authResponse.user.userType === 3) { // UserType.Administrator
          navigate('/admin/dashboard');
        } else {
          // For customers, stay on current page or go to home
          navigate('/');
        }
      } else {
        throw new Error(authResponse.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterDto) => {
    try {
      const authResponse = await authService.register(userData);
      
      if (authResponse.success && authResponse.user) {
        const mappedUser = mapUserDtoToUser(authResponse.user);
        setUser(mappedUser);
        setShowAuthModal(false);
        
        // Initialize cart and wishlist for new user
        await Promise.allSettled([
          loadUserCart(),
          loadUserWishlist()
        ]);
      } else {
        throw new Error(authResponse.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCart(null);
      setWishlistProductIds(new Set());
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state anyway
      setUser(null);
      setCart(null);
      setWishlistProductIds(new Set());
    }
  };

  // Helper function to map CartDto to Cart
  const mapCartDtoToCart = (cartDto: CartDto): Cart => ({
    id: cartDto.id,
    userId: cartDto.userId,
    createdAt: new Date(cartDto.createdAt),
    updatedAt: new Date(),
    totalItems: cartDto.totalItems,
    totalAmount: cartDto.totalAmount,
    items: cartDto.items?.map((itemDto: CartItemDto) => ({
      id: itemDto.id,
      cartId: cartDto.id,
      productId: itemDto.productId,
      quantity: itemDto.quantity,
      unitPrice: itemDto.unitPrice,
      totalPrice: itemDto.totalPrice,
      productVariant: itemDto.productVariant,
      createdAt: new Date(),
      product: itemDto.product ? mapProductDtoToProduct(itemDto.product) : {
        id: 0,
        vendorId: '',
        name: 'Unknown Product',
        description: '',
        price: 0,
        stockQuantity: 0,
        sku: '',
        isActive: false,
        createdDate: new Date(),
        updatedDate: new Date(),
        categoryId: 0,
        comparePrice: 0,
        weight: 0,
        weightUnit: undefined,
        requiresShipping: true,
        trackQuantity: true,
        continueSellingWhenOutOfStock: false,
        metaTitle: undefined,
        metaDescription: undefined,
        quantity: 0,
        compareAtPrice: 0,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        seoTitle: undefined,
        seoDescription: undefined,
        category: {
          id: 0,
          name: '',
          slug: '',
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
        images: [],
        variants: [],
        reviews: [],
        averageRating: 0,
        totalReviews: 0
      }
    })) || []
  });

  // Cart Handlers
  const handleAddToCart = async (productId: number) => {
    if (!user) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    try {
      // Add to cart and get the updated cart directly
      const updatedCartDto = await cartService.addToCart({
        productId,
        quantity: 1
      });
      
      // Map and update state immediately
      setCart(mapCartDtoToCart(updatedCartDto));
      
      // Show success feedback (optional)
      console.log('Item added to cart successfully');
      
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // TODO: Show error toast to user
    }
  };

  const handleUpdateCartQuantity = async (itemId: number, quantity: number) => {
    if (!user) return;

    try {
      const updatedCartDto = await cartService.updateCartItem({
        cartItemId: itemId,
        quantity
      });
      
      // Map and update state immediately
      setCart(mapCartDtoToCart(updatedCartDto));
      
    } catch (error) {
      console.error('Failed to update cart item:', error);
      // TODO: Show error toast to user
    }
  };

  const handleRemoveFromCart = async (itemId: number) => {
    if (!user) return;

    try {
      const updatedCartDto = await cartService.removeFromCart(itemId);
      
      // Map and update state immediately
      setCart(mapCartDtoToCart(updatedCartDto));
      
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
      setAuthModalUserType(2); // UserType.Vendor
      setShowAuthModal(true);
    } else {
      // Navigate to vendor registration/dashboard
      console.log('Navigate to vendor registration');
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleQuickView = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleCheckout = () => {
    setShowCartDrawer(false);
    if (!user) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }
    navigate('/checkout');
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleAuthClick = () => {
    setAuthModalTab('login');
    setAuthModalUserType(1); // Default to Customer
    setShowAuthModal(true);
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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header
          user={user || undefined}
          cartItemCount={cart?.totalItems || 0}
          isAuthenticated={!!user}
          onSearch={handleSearch}
          onCartClick={() => setShowCartDrawer(true)}
          onAuthClick={handleAuthClick}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route 
              path="/profile" 
              element={
                <ProfilePage 
                  user={user || undefined} 
                  onUpdateUser={(updatedUser) => {
                    // Update user state when profile is updated
                     setUser((prev: any) => prev ? { ...prev, ...updatedUser } : null);
                  }} 
                />
              } 
            />
            <Route 
              path="/orders" 
              element={
                <OrdersPage 
                  user={user || undefined}
                />
              } 
            />
            <Route 
              path="/vendor/dashboard" 
              element={<VendorDashboardPage />} 
            />
            <Route 
              path="/register" 
              element={
                <RegistrationPage 
                  onRegister={handleRegister} 
                />
              } 
            />
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
          defaultUserType={authModalUserType}
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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;