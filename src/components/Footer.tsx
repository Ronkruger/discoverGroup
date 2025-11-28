import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <img
              src="/logo.jpg"
              alt="Discover Group"
              className="h-14 mb-4 drop-shadow-lg"
            />
            <p className="text-sm text-gray-300 leading-relaxed">
              Your trusted partner in creating exceptional travel experiences. 
              Discover the world with confidence and style.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://www.facebook.com/discovergrp" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-blue-600 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/discover_grp/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-pink-600 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-yellow-400">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/destinations" 
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  Destinations
                </Link>
              </li>
              <li>
                <Link 
                  to="/deals" 
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  Special Deals
                </Link>
              </li>
              <li>
                <Link 
                  to="/about-us" 
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-yellow-400">Get in Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>
                  22nd Floor, The Upper Class Tower<br />
                  Quezon Ave, Diliman, QC 1103
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a href="tel:0285546954" className="hover:text-yellow-400 transition-colors">
                  02 8554 6954
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a href="mailto:inquiry@discovergrp.com" className="hover:text-yellow-400 transition-colors">
                  inquiry@discovergrp.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-yellow-400">Stay Updated</h4>
            <p className="text-sm text-gray-300 mb-4">
              Subscribe to our newsletter for exclusive deals and travel inspiration.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
              <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-12 mb-8"></div>

        {/* Additional Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-6">
          <Link to="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
          <span className="text-gray-600">•</span>
          <Link to="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link>
          <span className="text-gray-600">•</span>
          <Link to="/faq" className="hover:text-yellow-400 transition-colors">FAQ</Link>
          <span className="text-gray-600">•</span>
          <Link to="/careers" className="hover:text-yellow-400 transition-colors">Careers</Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="bg-gray-950 py-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="container mx-auto px-6">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} <span className="text-yellow-400 font-semibold">Discover Group</span>. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Creating unforgettable journeys since 2020
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
