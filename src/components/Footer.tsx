import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-16">
      {/* Top grid */}
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <img
            src="/logo.jpg"
            alt="Discover Group"
            className="h-12 mb-4 drop-shadow"
          />
          <p className="text-sm text-blue-100 leading-relaxed">
            Discover the world with us. Exceptional journeys, unforgettable
            memories.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/destinations" className="hover:text-yellow-300 transition">
                Destinations
              </Link>
            </li>
            <li>
              <Link to="/deals" className="hover:text-yellow-300 transition">
                Deals
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-yellow-300 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-yellow-300 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-4">Contact Us</h4>
          <ul className="space-y-2 text-sm text-blue-100">
            <li>📍 123 Travel Road, Manila, PH</li>
            <li>📞 +63 02 8526 8404</li>
            <li>💬 +65 8121 6065</li>
            <li>✉️ info@discovergroup.com</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" className="hover:text-yellow-300 transition">🌐</a>
            <a href="#" className="hover:text-yellow-300 transition">👍</a>
            <a href="#" className="hover:text-yellow-300 transition">🐦</a>
            <a href="#" className="hover:text-yellow-300 transition">📸</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div
        className="bg-blue-950 py-4 text-center text-xs text-blue-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        © {new Date().getFullYear()} Discover Group. All rights reserved.
      </motion.div>
    </footer>
  );
}
