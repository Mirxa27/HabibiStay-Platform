import React from 'react';
import { Link } from 'react-router';
import { Heart, Award, Users } from 'lucide-react';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

export default function AboutPage() {
  const founders = [
    {
      name: 'Abdullah Mirza',
      role: 'CEO & Product Vision',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300',
      bio: 'Visionary leader with 15+ years in real estate and technology. Abdullah drives product strategy and ensures HabibiStay stays ahead of market trends.',
    },
    {
      name: 'Vladimir Radchenko',
      role: 'CTO & Technology',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300',
      bio: 'Tech innovator specializing in AI and platform architecture. Vladimir leads our technical vision and ensures scalable, reliable systems.',
    },
    {
      name: 'Anna Miroshenchinko',
      role: 'COO & Operations',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b9c11e97?auto=format&fit=crop&w=300&h=300',
      bio: 'Operations expert with deep experience in hospitality and property management. Anna ensures exceptional service delivery across all touchpoints.',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Trust',
      description: 'We build lasting relationships based on transparency, reliability, and authentic care for our community.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We continuously raise the bar, delivering exceptional experiences that exceed expectations.',
    },
    {
      icon: Users,
      title: 'Shared Growth',
      description: 'We believe in creating value for all stakeholders - guests, owners, investors, and our team.',
    },
  ];

  const milestones = [
    { year: '2023', event: 'HabibiStay founded with Vision 2030 alignment' },
    { year: '2024', event: 'First 50 properties onboarded' },
    { year: '2024', event: 'AI assistant Sara launched' },
    { year: '2024', event: 'International investor program established' },
    { year: '2025', event: 'Expanding to 500+ properties across Riyadh' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={cn(
        "bg-gradient-to-br from-[#2957c3] to-blue-800 text-white",
        "py-12 sm:py-16 md:py-20"
      )}>
        <div className={containers.page}>
          <div className={cn(
            "text-center",
            responsiveClasses.padding.page
          )}>
            <h1 className={cn(
              responsiveClasses.text.h1,
              "mb-4 sm:mb-6"
            )}>
              Building the Future of
              <span className="block text-yellow-300">Saudi Hospitality</span>
            </h1>
            <p className={cn(
              "text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8",
              responsiveClasses.text.body
            )}>
              We're more than a platform—we're partners in Saudi Arabia's transformation, creating exceptional experiences while building sustainable wealth for our community.
            </p>
            <Link
              to="/contact"
              className={cn(
                "bg-white text-[#2957c3] rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block",
                responsiveClasses.button.primary,
                utils.touchTarget
              )}
            >
              Join Our Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={cn(
        responsiveClasses.padding.section,
        "bg-white"
      )}>
        <div className={containers.page}>
          <div className={cn(
            "grid grid-cols-1 lg:grid-cols-2",
            "gap-8 sm:gap-12 items-center",
            responsiveClasses.padding.page
          )}>
            <div>
              <h2 className={cn(
                responsiveClasses.text.h2,
                "text-gray-900 mb-4 sm:mb-6"
              )}>
                Our Mission
              </h2>
              <p className={cn(
                responsiveClasses.text.body,
                "text-gray-600 mb-4 sm:mb-6"
              )}>
                To democratize real estate investment while delivering world-class hospitality experiences that showcase the best of Saudi Arabia's culture and innovation.
              </p>
              <p className={cn(
                responsiveClasses.text.body,
                "text-gray-600 mb-4 sm:mb-6"
              )}>
                We believe that exceptional stays and exceptional returns aren't mutually exclusive. By combining cutting-edge technology with deep local expertise, we're creating a platform that benefits everyone in our ecosystem.
              </p>
              <div className={cn(
                "grid grid-cols-2 gap-4 sm:gap-6"
              )}>
                <div>
                  <div className={cn(
                    "text-xl sm:text-2xl font-bold text-[#2957c3] mb-1 sm:mb-2"
                  )}>500+</div>
                  <div className={cn(
                    responsiveClasses.text.small,
                    "text-gray-600"
                  )}>Properties Managed</div>
                </div>
                <div>
                  <div className={cn(
                    "text-xl sm:text-2xl font-bold text-[#2957c3] mb-1 sm:mb-2"
                  )}>15,000+</div>
                  <div className={cn(
                    responsiveClasses.text.small,
                    "text-gray-600"
                  )}>Happy Guests</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&h=600"
                alt="Modern Saudi Architecture"
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={cn(
        responsiveClasses.padding.section,
        "bg-gray-50"
      )}>
        <div className={containers.page}>
          <div className={cn(
            "text-center mb-12 sm:mb-16",
            responsiveClasses.padding.page
          )}>
            <h2 className={cn(
              responsiveClasses.text.h2,
              "text-gray-900 mb-3 sm:mb-4"
            )}>
              Our Values
            </h2>
            <p className={cn(
              responsiveClasses.text.body,
              "text-gray-600"
            )}>
              The principles that guide everything we do
            </p>
          </div>

          <div className={cn(
            responsiveClasses.grid.triple,
            "gap-6 sm:gap-8",
            responsiveClasses.padding.page
          )}>
            {values.map((value, index) => (
              <div
                key={index}
                className={cn(
                  responsiveClasses.card.base,
                  "hover:shadow-md transition-shadow text-center",
                  responsiveClasses.card.padding
                )}
              >
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                )}>
                  <value.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2957c3]" />
                </div>
                <h3 className={cn(
                  responsiveClasses.text.h4,
                  "text-gray-900 mb-3 sm:mb-4"
                )}>{value.title}</h3>
                <p className={cn(
                  responsiveClasses.text.small,
                  "text-gray-600"
                )}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Founders
            </h2>
            <p className="text-xl text-gray-600">
              Experienced leaders driving innovation in Saudi Arabia's hospitality sector
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow"
              >
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{founder.name}</h3>
                <p className="text-[#2957c3] font-semibold mb-4">{founder.role}</p>
                <p className="text-gray-600 text-sm">{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-[#2957c3] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-blue-100">
              Key milestones in building Saudi Arabia's premier hospitality platform
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center space-x-6 bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-white text-[#2957c3] rounded-full flex items-center justify-center font-bold">
                  {milestone.year}
                </div>
                <p className="text-lg">{milestone.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision 2030 Alignment */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&h=600"
                alt="Saudi Vision 2030"
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Aligned with Vision 2030
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                HabibiStay is proud to contribute to Saudi Arabia's Vision 2030 by enhancing the tourism experience, supporting local economic growth, and creating innovative employment opportunities.
              </p>
              <ul className="space-y-4">
                {[
                  'Supporting tourism sector growth targets',
                  'Creating jobs for Saudi nationals',
                  'Promoting cultural exchange and understanding',
                  'Driving technology innovation in hospitality',
                  'Building sustainable real estate investments',
                ].map((point, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-3 h-3 bg-[#2957c3] rounded-full mr-4"></div>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Whether you're a guest, property owner, or investor, there's a place for you in the HabibiStay family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/stays"
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Stays
            </Link>
            <Link
              to="/owners"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Become an Owner
            </Link>
            <Link
              to="/invest"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Start Investing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
