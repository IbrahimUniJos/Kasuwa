import { ArrowRightIcon, SparklesIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface HeroProps {
  onExploreProducts?: () => void;
  onBecomeVendor?: () => void;
}

export default function Hero({ onExploreProducts, onBecomeVendor }: HeroProps) {
  const features = [
    {
      icon: SparklesIcon,
      title: 'Authentic Northern Products',
      description: 'Discover genuine products from skilled artisans across Northern Nigeria'
    },
    {
      icon: TruckIcon,
      title: 'Fast & Reliable Delivery',
      description: 'Free delivery within Kano, express shipping to major northern cities'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Trusted',
      description: 'Safe payments with buyer protection and verified vendors'
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-kasuwa-primary-50 via-white to-kasuwa-secondary-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23de7e2e' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Cultural Greeting Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-kasuwa-accent-100 text-kasuwa-accent-800 rounded-full text-sm font-medium">
              <span className="mr-2">🌟</span>
              Sannu da zuwa! Welcome to Kasuwa
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-gray-900 leading-tight">
                Northern Nigeria's
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-kasuwa-primary-600 to-kasuwa-secondary-600">
                  Premier Marketplace
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Discover authentic products from talented artisans, farmers, and businesses across Arewa. 
                From traditional crafts to modern goods, find everything you need in one trusted marketplace.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-kasuwa-primary-600">1000+</div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-kasuwa-secondary-600">50k+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-kasuwa-accent-600">200k+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onExploreProducts}
                className="inline-flex items-center justify-center px-8 py-4 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Products
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={onBecomeVendor}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-kasuwa-secondary-600 text-kasuwa-secondary-600 font-semibold rounded-lg hover:bg-kasuwa-secondary-600 hover:text-white transition-all duration-200"
              >
                Become a Vendor
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="text-green-500 mr-1">✓</span>
                Verified Vendors
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-1">✓</span>
                Secure Payments
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-1">✓</span>
                Buyer Protection
              </div>
            </div>
          </div>

          {/* Visual/Image Section */}
          <div className="relative">
            {/* Main Image Placeholder */}
            <div className="relative bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 rounded-2xl p-8 shadow-2xl">
              {/* Cultural Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 rounded-2xl" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23de7e2e' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-8-8-8-8-16s8-8 16-8 8 8 8 16-8 8-16 8z'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              
              {/* Product Showcase Grid */}
              <div className="relative grid grid-cols-2 gap-4">
                {/* Product Card 1 */}
                <div className="bg-white rounded-xl p-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-24 bg-gradient-to-br from-kasuwa-accent-200 to-kasuwa-accent-300 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>

                {/* Product Card 2 */}
                <div className="bg-white rounded-xl p-4 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 mt-6">
                  <div className="w-full h-24 bg-gradient-to-br from-kasuwa-secondary-200 to-kasuwa-secondary-300 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>

                {/* Product Card 3 */}
                <div className="bg-white rounded-xl p-4 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 -mt-3">
                  <div className="w-full h-24 bg-gradient-to-br from-kasuwa-primary-200 to-kasuwa-primary-300 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                  </div>
                </div>

                {/* Product Card 4 */}
                <div className="bg-white rounded-xl p-4 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-kasuwa-accent-400 rounded-full flex items-center justify-center text-white text-2xl animate-bounce">
                🛍️
              </div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-kasuwa-secondary-400 rounded-full flex items-center justify-center text-white text-lg animate-pulse">
                ⭐
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-kasuwa-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}