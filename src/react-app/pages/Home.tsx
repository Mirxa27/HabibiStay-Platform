import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Star, Users, Building, TrendingUp } from 'lucide-react';
import { useChat } from '@/react-app/contexts/ChatContext';
import type { Property } from '@/shared/types';
import PropertyCard from '@/react-app/components/PropertyCard';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { openChat } = useChat();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await fetch('/api/properties/featured');
      const data = await response.json();
      if (data.success) {
        setFeaturedProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const whyHabibiStay = [
    {
      icon: Users,
      title: 'For Guests',
      subtitle: 'Memorable Stays',
      description: 'Discover exceptional accommodations with personalized service and local insights.',
    },
    {
      icon: Building,
      title: 'For Property Owners',
      subtitle: 'Hands-Off Income',
      description: 'Let us manage your property while you earn consistent returns with full transparency.',
    },
    {
      icon: TrendingUp,
      title: 'For Investors',
      subtitle: 'Proven Growth',
      description: 'Access Riyadh\'s booming real estate market with our data-driven investment platform.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://mocha-cdn.com/0198e085-9738-7b3f-a205-ec01ec5b130b/Hero.jpg')`
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Exceptional Stays.<br />
            <span className="text-[#2957c3] bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
              Exceptional Returns.
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Book memorable getaways, unlock steady income, and grow your capital—all with HabibiStay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openChat}
              className="bg-[#2957c3] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book a Stay
            </button>
            <Link
              to="/owners"
              className="bg-white bg-opacity-20 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
            >
              List Property
            </Link>
            <Link
              to="/invest"
              className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Invest Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why HabibiStay Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why HabibiStay?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're traveling, investing, or hosting, we've built the perfect platform for exceptional experiences and returns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyHabibiStay.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                  <item.icon className="h-8 w-8 text-[#2957c3]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-[#2957c3] font-semibold mb-3">{item.subtitle}</p>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600">
              Discover our handpicked exceptional accommodations in Riyadh
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured properties available at the moment.</p>
              <Link
                to="/stays"
                className="inline-flex items-center mt-4 text-[#2957c3] hover:text-blue-700 font-medium"
              >
                Browse all properties <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/stays"
              className="inline-flex items-center bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Properties <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-[#2957c3] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium mb-6">
              "HabibiStay transformed our Riyadh experience. The property was exceptional, and Sara's assistance made everything seamless."
            </blockquote>
            <cite className="text-blue-200">— Sarah & Ahmed, Dubai Travelers</cite>
          </div>
          <Link
            to="/stories"
            className="inline-flex items-center text-white border-2 border-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#2957c3] transition-all duration-300"
          >
            More Stories <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands who trust HabibiStay for exceptional stays and returns
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openChat}
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Talk to Sara
            </button>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
