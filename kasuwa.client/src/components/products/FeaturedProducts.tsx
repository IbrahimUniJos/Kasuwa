import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import type { Product } from '../../types';

interface FeaturedProductsProps {
  products?: Product[];
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
  wishlistProductIds?: Set<number>;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  autoPlay?: boolean;
  className?: string;
}

export default function FeaturedProducts({
  products = [],
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistProductIds = new Set(),
  title = "Featured Products",
  subtitle = "Discover the best products handpicked by our team from talented Northern Nigerian vendors",
  maxItems = 8,
  autoPlay = true,
  className = ''
}: FeaturedProductsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, maxItems);
  const itemsPerSlide = 4; // Show 4 products per slide on desktop
  const totalSlides = Math.ceil(featuredProducts.length / itemsPerSlide);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsPlaying(false); // Stop auto-play when user interacts
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsPlaying(false); // Stop auto-play when user interacts
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false); // Stop auto-play when user interacts
  };

  if (featuredProducts.length === 0) {
    return (
      <section className={`py-16 bg-gradient-to-br from-kasuwa-primary-50 to-kasuwa-secondary-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 rounded-full flex items-center justify-center">
              <FireIcon className="h-12 w-12 text-kasuwa-primary-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No featured products available at the moment. Check back soon for exciting deals!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gradient-to-br from-kasuwa-primary-50 to-kasuwa-secondary-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kasuwa-primary-600 to-kasuwa-secondary-600 rounded-full mb-6">
            <FireIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Products Carousel */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-1">
                    {featuredProducts
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((product) => (
                        <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                          <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                            onToggleWishlist={onToggleWishlist}
                            onQuickView={onQuickView}
                            isInWishlist={wishlistProductIds.has(product.id)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10 group"
                aria-label="Previous products"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 group-hover:text-kasuwa-primary-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10 group"
                aria-label="Next products"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600 group-hover:text-kasuwa-primary-600" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-kasuwa-primary-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auto-play Control */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-kasuwa-primary-600 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span>{isPlaying ? 'Auto-playing' : 'Auto-play paused'}</span>
            </button>
          </div>
        )}

        {/* View All Products Link */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 transition-colors shadow-lg hover:shadow-xl">
            View All Products
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Cultural Design Element */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full">
            <span className="text-lg">🌟</span>
            <span className="text-sm font-medium text-kasuwa-primary-700">
              Authentic Northern Nigerian Products
            </span>
            <span className="text-lg">✨</span>
          </div>
        </div>
      </div>
    </section>
  );
}