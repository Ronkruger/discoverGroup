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
              <Link to="/about-us" className="hover:text-yellow-300 transition">
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
            <li>📍 22nd Floor, The Upper Class Tower</li>
            <li className="pl-4">Quezon Ave, Diliman, QC 1103</li>
            <li>📞 02 8554 6954</li>
            <li>✉️ inquiry@discovergrp.com</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/discovergrp" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition text-2xl" title="Facebook">📘</a>
            <a href="https://www.instagram.com/discover_grp/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition text-2xl" title="Instagram">📸</a>
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
