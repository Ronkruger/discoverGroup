import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Globe, Award, Phone, MapPin, Calendar, Briefcase, Plane, Shield, FileText, Sparkles, ChevronRight, Target, Heart, TrendingUp } from "lucide-react";

type TabType = 'story' | 'services' | 'values';

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState<TabType>('story');

  const services = [
    { icon: Plane, title: "International & Local Tours", desc: "From European adventures to Philippine wonders" },
    { icon: FileText, title: "Visa Assistance", desc: "Specializing in Japan visa processing" },
    { icon: Globe, title: "Airline Ticketing", desc: "Best rates and flexible booking options" },
    { icon: Briefcase, title: "Corporate Travel", desc: "Meetings, events, and team building" },
    { icon: Shield, title: "Airport Assistance", desc: "Seamless arrival and departure support" },
    { icon: Users, title: "Group Packages", desc: "Customized itineraries for any group size" },
  ];

  const stats = [
    { number: "2008", label: "Established", icon: Calendar },
    { number: "15+", label: "Years Experience", icon: Award },
    { number: "32K+", label: "Happy Travelers", icon: Users },
    { number: "100%", label: "Personalized", icon: Heart },
  ];

  const values = [
    { 
      icon: Target, 
      title: "Customer-Centric", 
      desc: "Every itinerary is tailored to your preferences, interests, and budget. Your dream journey is our priority.",
      color: "from-blue-500 to-blue-600"
    },
    { 
      icon: Heart, 
      title: "Collaborative Approach", 
      desc: "We work closely with you to understand your vision and craft experiences that exceed expectations.",
      color: "from-pink-500 to-pink-600"
    },
    { 
      icon: TrendingUp, 
      title: "Quality & Excellence", 
      desc: "DOT-accredited since 2022, we maintain the highest standards in travel services and customer care.",
      color: "from-green-500 to-green-600"
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-white">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("/assets/paris.jpg")',
            transform: 'scale(1.1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/95 via-purple-50/90 to-white/95" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{ 
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            y: [0, -40, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <img 
              src="/logo.jpg" 
              alt="Discover Group Logo" 
              className="h-32 w-32 mx-auto rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-sm"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-6"
          >
            Discover Group
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl text-gray-700 max-w-3xl mx-auto mb-4"
          >
            Creating Unforgettable Travel Experiences Since 2008
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-yellow-600"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-lg">Quezon City, Philippines</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-8 h-8 text-gray-900 rotate-90" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-glass rounded-2xl p-6 text-center hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes us the trusted travel partner for thousands of adventurers
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { key: 'story', label: 'Our Journey', icon: Sparkles },
              { key: 'services', label: 'What We Offer', icon: Briefcase },
              { key: 'values', label: 'Our Values', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            {activeTab === 'story' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card-glass rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Founded in May 2008</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Discover Group of Travel Services Inc. began with a simple vision: to make travel accessible, 
                    enjoyable, and truly unforgettable for every Filipino traveler.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    What started as a small travel agency in Quezon City has grown into a trusted name in the 
                    Philippine travel industry, serving thousands of satisfied customers across 15+ years.
                  </p>
                </div>

                <div className="card-glass rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Headquarters</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Located at the 22nd floor of The Upper Class Tower on Quezon Avenue, Diliman, 
                    our modern office serves as the hub for all our travel operations.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Our strategic location in Metro Manila allows us to serve clients nationwide while 
                    maintaining close partnerships with international travel networks.
                  </p>
                </div>

                <div className="card-glass rounded-2xl p-8 md:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Accredited & Trusted</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    As a DOT-accredited travel agency since 2022, we uphold the highest standards of service quality 
                    and professionalism. Our dedicated team of 11-50 travel experts combines personalized attention 
                    with industry expertise to ensure every journey exceeds expectations.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card-glass rounded-2xl p-6 hover:shadow-2xl transition-all group cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{service.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-6">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card-glass rounded-2xl p-8 hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-start gap-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <value.icon className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                        <p className="text-gray-700 text-lg leading-relaxed">{value.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed mb-8">
              To make travel accessible, enjoyable, and truly unforgettable by crafting personalized 
              journeys that create lasting memories and meaningful connections.
            </p>
            <p className="text-xl text-gray-600 mb-12">
              Whether you're planning a family holiday, a group adventure, or a once-in-a-lifetime journey, 
              Discover Group is your trusted partner in turning travel dreams into reality.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold text-lg rounded-xl shadow-2xl hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 hover:-translate-y-1 transition-all"
            >
              <Phone className="w-6 h-6" />
              Start Your Journey Today
            </a>
          </motion.div>
        </div>
      </section>

      {/* Team Size & Approach */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card-glass rounded-2xl p-8"
            >
              <Users className="w-16 h-16 text-yellow-500 mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Dedicated Team</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Our team of 11-50 travel professionals brings together years of experience, 
                local knowledge, and a passion for creating extraordinary travel experiences.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Each member is committed to providing personalized service while maintaining 
                the professional expertise you deserve.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card-glass rounded-2xl p-8"
            >
              <Heart className="w-16 h-16 text-pink-500 mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Creating Stories</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                We don't just book trips—we create stories and build memories that last a lifetime.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Every itinerary is thoughtfully designed to reflect your unique preferences, ensuring 
                your journey is as individual as you are.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
