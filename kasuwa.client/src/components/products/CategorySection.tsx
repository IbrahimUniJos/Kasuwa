import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { ProductCategory } from '../../types';

interface CategorySectionProps {
  categories?: ProductCategory[];
  onCategoryClick?: (categoryId: number) => void;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  className?: string;
}

export default function CategorySection({
  categories = [],
  onCategoryClick,
  title = "Shop by Category",
  subtitle = "Explore authentic products from different regions and traditions across Northern Nigeria",
  showViewAll = true,
  className = ''
}: CategorySectionProps) {
  // Mock categories if none provided (for demo purposes)
  const defaultCategories: Partial<ProductCategory>[] = [
    {
      id: 1,
      name: "Traditional Textiles",
      description: "Authentic Hausa fabrics and traditional wear",
      slug: "traditional-textiles",
      isActive: true,
      displayOrder: 1,
      subCategories: []
    },
    {
      id: 2,
      name: "Handcrafted Jewelry",
      description: "Beautiful traditional and modern jewelry pieces",
      slug: "handcrafted-jewelry",
      isActive: true,
      displayOrder: 2,
      subCategories: []
    },
    {
      id: 3,
      name: "Agricultural Products",
      description: "Fresh produce and processed foods from northern farms",
      slug: "agricultural-products",
      isActive: true,
      displayOrder: 3,
      subCategories: []
    },
    {
      id: 4,
      name: "Arts & Crafts",
      description: "Handmade decorative items and cultural artifacts",
      slug: "arts-crafts",
      isActive: true,
      displayOrder: 4,
      subCategories: []
    },
    {
      id: 5,
      name: "Traditional Medicine",
      description: "Natural herbs and traditional healing products",
      slug: "traditional-medicine",
      isActive: true,
      displayOrder: 5,
      subCategories: []
    },
    {
      id: 6,
      name: "Modern Fashion",
      description: "Contemporary clothing with traditional influences",
      slug: "modern-fashion",
      isActive: true,
      displayOrder: 6,
      subCategories: []
    },
    {
      id: 7,
      name: "Home & Decor",
      description: "Traditional and modern home decoration items",
      slug: "home-decor",
      isActive: true,
      displayOrder: 7,
      subCategories: []
    },
    {
      id: 8,
      name: "Electronics",
      description: "Modern electronics and tech accessories",
      slug: "electronics",
      isActive: true,
      displayOrder: 8,
      subCategories: []
    }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Cultural icons for categories
  const categoryIcons: Record<string, string> = {
    "traditional-textiles": "🧵",
    "handcrafted-jewelry": "💍",
    "agricultural-products": "🌾",
    "arts-crafts": "🎨",
    "traditional-medicine": "🌿",
    "modern-fashion": "👗",
    "home-decor": "🏠",
    "electronics": "📱"
  };

  const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || "🛍️";
  };

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {displayCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick?.(category.id!)}
              className="group cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-kasuwa-primary-50 to-kasuwa-secondary-50 rounded-2xl p-6 lg:p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                {/* Category Icon */}
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <span className="text-3xl lg:text-4xl">
                    {getCategoryIcon(category.slug!)}
                  </span>
                </div>

                {/* Category Name */}
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 group-hover:text-kasuwa-primary-600 transition-colors">
                  {category.name}
                </h3>

                {/* Category Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Browse Link */}
                <div className="inline-flex items-center text-sm font-medium text-kasuwa-primary-600 group-hover:text-kasuwa-primary-700">
                  <span>Browse</span>
                  <ChevronRightIcon className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-kasuwa-primary-100/20 to-kasuwa-secondary-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Categories */}
        {showViewAll && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-3 border-2 border-kasuwa-primary-600 text-kasuwa-primary-600 font-semibold rounded-lg hover:bg-kasuwa-primary-600 hover:text-white transition-all duration-200 transform hover:scale-105">
              View All Categories
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {/* Cultural Highlight */}
        <div className="mt-16 bg-gradient-to-r from-kasuwa-accent-100 to-kasuwa-secondary-100 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🌍</span>
            <h3 className="text-xl lg:text-2xl font-bold text-kasuwa-primary-700">
              Celebrating Northern Nigeria's Rich Heritage
            </h3>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            From traditional Hausa textiles to modern innovations, our marketplace showcases the diverse craftsmanship 
            and entrepreneurial spirit of Arewa. Each category represents centuries of cultural heritage and contemporary excellence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-white/60 rounded-full text-kasuwa-primary-700 font-medium">
              🏺 Traditional Crafts
            </span>
            <span className="px-3 py-1 bg-white/60 rounded-full text-kasuwa-primary-700 font-medium">
              🌾 Local Produce
            </span>
            <span className="px-3 py-1 bg-white/60 rounded-full text-kasuwa-primary-700 font-medium">
              👔 Modern Fashion
            </span>
            <span className="px-3 py-1 bg-white/60 rounded-full text-kasuwa-primary-700 font-medium">
              💎 Quality Assured
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}