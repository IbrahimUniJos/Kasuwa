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
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' }
      ]
    },
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'Categories', href: '/categories' },
        { name: 'Featured Items', href: '/featured' },
        { name: 'New Arrivals', href: '/new' }
      ]
    },
    {
      title: 'Sell',
      links: [
        { name: 'Become a Vendor', href: '/vendor/register' },
        { name: 'Vendor Dashboard', href: '/vendor/dashboard' },
        { name: 'Seller Guide', href: '/seller-guide' },
        { name: 'Commission Rates', href: '/vendor/fees' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'Returns', href: '/returns' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'Instagram', href: '#', icon: '📷' },
    { name: 'WhatsApp', href: '#', icon: '💬' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-kasuwa-primary-600 to-kasuwa-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Stay Connected with Kasuwa
              </h3>
              <p className="text-white/90 text-sm">
                Get exclusive offers and updates from Northern Nigeria's premier marketplace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button className="px-6 py-2.5 bg-white text-kasuwa-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold">Kasuwa</span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Northern Nigeria's premier online marketplace connecting authentic local vendors 
              with customers across the region.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPinIcon className="h-4 w-4 text-kasuwa-accent-400 flex-shrink-0" />
                <span>Kano, Nigeria</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <PhoneIcon className="h-4 w-4 text-kasuwa-accent-400 flex-shrink-0" />
                <span>+234 (0) 900 KASUWA</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <EnvelopeIcon className="h-4 w-4 text-kasuwa-accent-400 flex-shrink-0" />
                <span>support@kasuwa.ng</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <ChatBubbleLeftIcon className="h-4 w-4 text-kasuwa-accent-400 flex-shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-kasuwa-primary-600 transition-colors text-sm"
                  aria-label={social.name}
                >
                  <span>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="font-semibold text-white text-sm">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-kasuwa-accent-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cultural Highlight */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-lg">🌍</span>
              <h4 className="text-sm font-semibold text-kasuwa-accent-400">
                Celebrating Arewa Culture & Commerce
              </h4>
              <span className="text-lg">✨</span>
            </div>
            <p className="text-gray-300 text-xs max-w-2xl mx-auto">
              Kasuwa proudly showcases the rich heritage and entrepreneurial spirit of Northern Nigeria.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="md:flex md:items-center md:justify-between text-sm">
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                &copy; {currentYear} Kasuwa Nigeria. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built with <HeartIcon className="inline h-3 w-3 text-red-500 mx-1" /> for Northern Nigeria
              </p>
            </div>
            
            <div className="mt-3 md:mt-0">
              <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-xs text-gray-400">
                <a href="/privacy" className="hover:text-kasuwa-accent-400 transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="hover:text-kasuwa-accent-400 transition-colors">
                  Terms
                </a>
                <a href="/cookies" className="hover:text-kasuwa-accent-400 transition-colors">
                  Cookies
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