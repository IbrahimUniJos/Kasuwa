import { HeartIcon } from '@heroicons/react/24/solid';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Kasuwa',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Press & Media', href: '/press' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'For Buyers',
      links: [
        { name: 'Browse Products', href: '/products' },
        { name: 'Categories', href: '/categories' },
        { name: 'Buyer Protection', href: '/buyer-protection' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'Return Policy', href: '/returns' }
      ]
    },
    {
      title: 'For Vendors',
      links: [
        { name: 'Sell on Kasuwa', href: '/vendor/register' },
        { name: 'Vendor Dashboard', href: '/vendor/dashboard' },
        { name: 'Seller Handbook', href: '/seller-guide' },
        { name: 'Commission Rates', href: '/vendor/fees' },
        { name: 'Vendor Support', href: '/vendor/support' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Live Chat', href: '/chat' },
        { name: 'Report an Issue', href: '/report' },
        { name: 'Community', href: '/community' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'Instagram', href: '#', icon: '📷' },
    { name: 'WhatsApp', href: '#', icon: '💬' },
    { name: 'Telegram', href: '#', icon: '✈️' }
  ];

  const popularCategories = [
    'Hausa Traditional Wear', 'Kano Textiles', 'Northern Crafts', 
    'Fulani Jewelry', 'Arewa Fashion', 'Traditional Foods',
    'Handmade Items', 'Agriculture Products'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-kasuwa-primary-600 to-kasuwa-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Stay Connected with Kasuwa
              </h3>
              <p className="text-white/90">
                Get exclusive offers, new vendor spotlights, and updates from Northern Nigeria's premier marketplace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button className="px-6 py-3 bg-white text-kasuwa-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold">Kasuwa</span>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed max-w-md">
              Northern Nigeria's premier online marketplace connecting authentic local vendors 
              with customers across the region. Discover quality products, support local businesses, 
              and experience the rich culture of Arewa.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPinIcon className="h-5 w-5 text-kasuwa-accent-400" />
                <span>Kano, Nigeria & serving all Northern states</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <PhoneIcon className="h-5 w-5 text-kasuwa-accent-400" />
                <span>+234 (0) 900 KASUWA</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <EnvelopeIcon className="h-5 w-5 text-kasuwa-accent-400" />
                <span>support@kasuwa.ng</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <ChatBubbleLeftIcon className="h-5 w-5 text-kasuwa-accent-400" />
                <span>24/7 Customer Support</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-kasuwa-primary-600 transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-lg font-semibold text-white">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-kasuwa-accent-400 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Categories */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">
            Popular Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((category) => (
              <a
                key={category}
                href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-kasuwa-primary-600 hover:text-white transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        {/* Cultural Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl">🌍</span>
              <h4 className="text-xl font-semibold text-kasuwa-accent-400">
                Celebrating Arewa Culture
              </h4>
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-center text-gray-300 max-w-2xl mx-auto">
              Kasuwa proudly showcases the rich heritage, craftsmanship, and entrepreneurial spirit 
              of Northern Nigeria. From traditional Hausa textiles to modern innovations, 
              we bridge culture and commerce for a thriving digital marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; {currentYear} Kasuwa Nigeria. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built with <HeartIcon className="inline h-3 w-3 text-red-500 mx-1" /> for Northern Nigeria
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-kasuwa-accent-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-kasuwa-accent-400 transition-colors">
                  Terms of Service
                </a>
                <a href="/cookies" className="hover:text-kasuwa-accent-400 transition-colors">
                  Cookie Policy
                </a>
                <a href="/accessibility" className="hover:text-kasuwa-accent-400 transition-colors">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}