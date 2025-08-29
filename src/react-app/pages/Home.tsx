import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Star, Users, Building, TrendingUp } from 'lucide-react';
import { useChat } from '@/react-app/contexts/ChatContext';
import type { Property } from '@/shared/types';
import PropertyCard from '@/react-app/components/PropertyCard';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

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
        className={cn(
          "relative min-h-screen bg-cover bg-center bg-no-repeat",
          responsiveClasses.flex.center,
          responsiveClasses.padding.page
        )}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://mocha-cdn.com/0198e085-9738-7b3f-a205-ec01ec5b130b/Hero.jpg')`
        }}
      >
        <div className={cn(
          "text-center text-white",
          containers.content,
          "py-8 sm:py-12 md:py-16"
        )}>
          <h1 className={cn(
            responsiveClasses.text.h1,
            "mb-4 sm:mb-6"
          )}>
            Exceptional Stays.<br />
            <span className="text-[#2957c3] bg-white bg-opacity-10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Exceptional Returns.
            </span>
          </h1>
          <p className={cn(
            "text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200",
            "max-w-3xl mx-auto"
          )}>
            Book memorable getaways, unlock steady income, and grow your capital—all with HabibiStay.
          </p>
          <div className={responsiveClasses.button.group}>
            <button
              onClick={openChat}
              className={cn(
                responsiveClasses.button.primary,
                "bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg",
                utils.touchTarget
              )}
            >
              Book a Stay
            </button>
            <Link
              to="/owners"
              className={cn(
                responsiveClasses.button.primary,
                "bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30",
                utils.touchTarget
              )}
            >
              List Property
            </Link>
            <Link
              to="/invest"
              className={cn(
                responsiveClasses.button.primary,
                "bg-transparent text-white rounded-lg font-semibold border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300",
                utils.touchTarget
              )}
            >
              Invest Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why HabibiStay Section */}
      <section className={cn(responsiveClasses.padding.section, "bg-gray-50")}>
        <div className={containers.page}>
          <div className={cn("text-center", responsiveClasses.padding.section)}>
            <h2 className={cn(
              responsiveClasses.text.h2,
              "text-gray-900 mb-2 sm:mb-4"
            )}>
              Why HabibiStay?
            </h2>
            <p className={cn(
              responsiveClasses.text.body,
              "text-gray-600 max-w-3xl mx-auto"
            )}>
              Whether you're traveling, investing, or hosting, we've built the perfect platform for exceptional experiences and returns.
            </p>
          </div>
          
          <div className={responsiveClasses.grid.triple}>
            {whyHabibiStay.map((item, index) => (
              <div
                key={index}
                className={cn(
                  responsiveClasses.card.base,
                  responsiveClasses.card.padding,
                  "hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                )}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2957c3]" />
                </div>
                <h3 className={cn(
                  responsiveClasses.text.h4,
                  "text-gray-900 mb-1 sm:mb-2"
                )}>{item.title}</h3>
                <p className={cn(
                  responsiveClasses.text.small,
                  "text-[#2957c3] font-semibold mb-2 sm:mb-3"
                )}>{item.subtitle}</p>
                <p className={cn(
                  responsiveClasses.text.small,
                  "text-gray-600"
                )}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className={cn(responsiveClasses.padding.section, "bg-white")}>
        <div className={containers.page}>
          <div className={cn("text-center", responsiveClasses.padding.section)}>
            <h2 className={cn(
              responsiveClasses.text.h2,
              "text-gray-900 mb-2 sm:mb-4"
            )}>
              Featured Properties
            </h2>
            <p className={cn(
              responsiveClasses.text.body,
              "text-gray-600"
            )}>
              Discover our handpicked exceptional accommodations in Riyadh
            </p>
          </div>

          {loading ? (
            <div className={responsiveClasses.grid.double}>
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 sm:h-56 md:h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className={cn(
              responsiveClasses.grid.double,
              "gap-4 sm:gap-6 md:gap-8"
            )}>
              {featuredProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  onBook={(id) => console.log('Book property:', id)}
                  onViewDetails={(id) => console.log('View property:', id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className={cn(
                responsiveClasses.text.body,
                "text-gray-500"
              )}>No featured properties available at the moment.</p>
              <Link
                to="/stays"
                className={cn(
                  "inline-flex items-center mt-4 text-[#2957c3] hover:text-blue-700 font-medium",
                  responsiveClasses.text.small,
                  utils.touchTarget
                )}
              >
                Browse all properties <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/stays"
              className={cn(
                "inline-flex items-center bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors",
                responsiveClasses.button.primary,
                utils.touchTarget
              )}
            >
              View All Properties <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className={cn(responsiveClasses.padding.section, "bg-[#2957c3] text-white")}>
        <div className={cn(containers.content, "text-center")}>
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className={cn(
              "font-medium mb-4 sm:mb-6",
              "text-lg sm:text-xl md:text-2xl lg:text-3xl"
            )}>
              "HabibiStay transformed our Riyadh experience. The property was exceptional, and Sara's assistance made everything seamless."
            </blockquote>
            <cite className={cn(
              responsiveClasses.text.small,
              "text-blue-200"
            )}>— Sarah & Ahmed, Dubai Travelers</cite>
          </div>
          <Link
            to="/stories"
            className={cn(
              "inline-flex items-center text-white border-2 border-white rounded-lg hover:bg-white hover:text-[#2957c3] transition-all duration-300",
              responsiveClasses.button.secondary,
              utils.touchTarget
            )}
          >
            More Stories <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={cn(responsiveClasses.padding.section, "bg-gray-900 text-white")}>
        <div className={cn(containers.content, "text-center")}>
          <h2 className={cn(
            responsiveClasses.text.h2,
            "mb-4 sm:mb-6"
          )}>
            Ready to Get Started?
          </h2>
          <p className={cn(
            responsiveClasses.text.body,
            "text-gray-300 mb-6 sm:mb-8"
          )}>
            Join thousands who trust HabibiStay for exceptional stays and returns
          </p>
          <div className={responsiveClasses.button.group}>
            <button
              onClick={openChat}
              className={cn(
                "bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors",
                responsiveClasses.button.primary,
                utils.touchTarget
              )}
            >
              Talk to Sara
            </button>
            <Link
              to="/contact"
              className={cn(
                "border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors",
                responsiveClasses.button.primary,
                utils.touchTarget
              )}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
