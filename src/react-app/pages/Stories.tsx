import { useState } from 'react';
import { Link } from 'react-router';
import { Star, Quote, ArrowRight } from 'lucide-react';

export default function StoriesPage() {
  const stories = [
    {
      type: 'Owner',
      name: 'Ahmed Al-Rashid',
      role: 'Property Owner',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
      quote: "HabibiStay transformed my property into a consistent income stream. In 18 months, I've earned 22% ROI with zero management effort on my part.",
      details: 'Ahmed owns a 3-bedroom apartment in Al-Malaz district. Since partnering with HabibiStay, his property maintains 94% occupancy with premium pricing.',
      metrics: {
        roi: '22%',
        occupancy: '94%',
        duration: '18 months'
      }
    },
    {
      type: 'Investor',
      name: 'Sarah Mitchell',
      role: 'International Investor',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b9c11e97?auto=format&fit=crop&w=150&h=150',
      quote: "Investing in Riyadh's real estate through HabibiStay has been one of my best financial decisions. The transparency and returns exceed my expectations.",
      details: 'Sarah, based in London, invested in multiple properties through our investment platform and now enjoys passive income from Saudi Arabia.',
      metrics: {
        roi: '19%',
        properties: '4',
        duration: '2 years'
      }
    },
    {
      type: 'Guest',
      name: 'Mohammad & Fatima Hassan',
      role: 'Business Travelers',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
      quote: "Every stay with HabibiStay feels like coming home. Sara's assistance and the quality of properties make business travel in Riyadh genuinely enjoyable.",
      details: 'Regular business travelers who have stayed in 8 different HabibiStay properties across Riyadh over the past year.',
      metrics: {
        stays: '8',
        rating: '5.0',
        duration: '1 year'
      }
    },
    {
      type: 'Owner',
      name: 'Khalid Bin Salman',
      role: 'Multi-Property Owner',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
      quote: "With HabibiStay managing my portfolio, I've expanded from 1 to 5 properties. Their data-driven approach helps me make smart investment decisions.",
      details: 'Started with one property and now owns five premium accommodations across different Riyadh districts, all managed by HabibiStay.',
      metrics: {
        properties: '5',
        growth: '400%',
        duration: '2.5 years'
      }
    },
    {
      type: 'Investor',
      name: 'Emma Chen',
      role: 'Tech Entrepreneur',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
      quote: "As a tech entrepreneur, I appreciate HabibiStay's innovative approach to real estate investment. The platform makes everything transparent and efficient.",
      details: 'Tech entrepreneur from Singapore who diversified her portfolio with Saudi real estate through HabibiStay\'s investment platform.',
      metrics: {
        roi: '21%',
        investment: '$150K',
        duration: '14 months'
      }
    },
    {
      type: 'Guest',
      name: 'Dr. James Wilson',
      role: 'Medical Conference Attendee',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&h=150',
      quote: "Attending conferences in Riyadh is now something I look forward to. HabibiStay properties are consistently excellent, and Sara makes everything seamless.",
      details: 'International medical professional who regularly visits Riyadh for conferences and exclusively stays with HabibiStay.',
      metrics: {
        visits: '12',
        rating: '4.9',
        duration: '3 years'
      }
    }
  ];

  const categories = ['All', 'Owner', 'Investor', 'Guest'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredStories = selectedCategory === 'All' 
    ? stories 
    : stories.filter(story => story.type === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2957c3] to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Real Results,
              <span className="block text-yellow-300">Real People</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Discover how HabibiStay is transforming lives through exceptional stays, steady income, and smart investments across our growing community.
            </p>
            <Link
              to="/contact"
              className="bg-white text-[#2957c3] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Share Your Story
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#2957c3] text-white'
                      : 'text-gray-600 hover:text-[#2957c3] hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredStories.map((story, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{story.name}</h3>
                    <p className="text-[#2957c3] font-semibold text-sm">{story.role}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-[#2957c3] opacity-20" />
                  <blockquote className="text-gray-700 italic text-lg leading-relaxed pl-6">
                    "{story.quote}"
                  </blockquote>
                </div>
                
                <p className="text-gray-600 mb-6">{story.details}</p>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {Object.entries(story.metrics).map(([key, value], metricIndex) => (
                    <div key={metricIndex} className="text-center">
                      <div className="text-xl font-bold text-[#2957c3]">{value}</div>
                      <div className="text-xs text-gray-600 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20 bg-[#2957c3] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Community Impact
            </h2>
            <p className="text-xl text-blue-100">
              The numbers behind our success stories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Happy Property Owners' },
              { value: '15,000+', label: 'Satisfied Guests' },
              { value: '150+', label: 'Active Investors' },
              { value: '₹50M+', label: 'Revenue Generated' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands who have transformed their relationship with real estate through HabibiStay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/owners"
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Become an Owner <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/invest"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Start Investing
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Share Your Story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
