import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-extrabold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                NovaMart
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your premium multi-vendor marketplace. Shop from thousands of sellers with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/products" className="hover:text-primary-600 transition-colors">All Products</Link></li>
              <li><Link to="/products?sort=newest" className="hover:text-primary-600 transition-colors">New Arrivals</Link></li>
              <li><Link to="/products?event=flash_sale" className="hover:text-primary-600 transition-colors">Flash Sale</Link></li>
              <li><Link to="/products?sort=best_selling" className="hover:text-primary-600 transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Returns</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Become a Seller</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} NovaMart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-medium">We accept:</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
