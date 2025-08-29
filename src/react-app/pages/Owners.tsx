import { Link } from 'react-router';
import { ArrowRight, DollarSign, TrendingUp, Shield, Clock, BarChart3, Users } from 'lucide-react';

export default function OwnersPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Full Management',
      description: 'We handle everything from guest communication to maintenance, so you can sit back and earn.',
    },
    {
      icon: TrendingUp,
      title: 'Pricing Optimization',
      description: 'AI-powered dynamic pricing ensures you get maximum revenue from every booking.',
    },
    {
      icon: Shield,
      title: 'Complete Transparency',
      description: 'Real-time reporting and detailed analytics keep you informed about your property performance.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Sign Up',
      description: 'Create your account and tell us about your property.',
    },
    {
      step: '02',
      title: 'We Manage',
      description: 'Our team handles listings, guests, cleaning, and maintenance.',
    },
    {
      step: '03',
      title: 'You Earn',
      description: 'Receive monthly payouts with detailed performance reports.',
    },
  ];

  const stats = [
    { value: '17%', label: 'Average Annual ROI' },
    { value: '95%', label: 'Occupancy Rate' },
    { value: '24/7', label: 'Support Available' },
    { value: '500+', label: 'Properties Managed' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2957c3] to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Turn Your Keys into
                <span className="block text-yellow-300">Consistent Cashflow</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Join hundreds of property owners who trust HabibiStay to maximize their rental income with zero effort required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-[#2957c3] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Start Earning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/stories"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#2957c3] transition-colors inline-flex items-center justify-center"
                >
                  Owner Stories
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560448204-e1a3ecbdd6cc?auto=format&fit=crop&w=800&h=600"
                alt="Luxury Property"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-[#2957c3]">₹8,500 SAR</div>
                <div className="text-gray-600">Monthly Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2957c3] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Property Owners Choose HabibiStay
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We take care of everything so you can focus on what matters most while your property generates consistent income.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                  <benefit.icon className="h-8 w-8 text-[#2957c3]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#2957c3] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-blue-100">
              Three simple steps to start earning from your property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-blue-100">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Property Management
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to maximize your property's potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Guest Management',
                description: 'Professional guest communication, check-ins, and support',
              },
              {
                icon: Clock,
                title: 'Maintenance & Cleaning',
                description: 'Regular cleaning and maintenance to keep your property pristine',
              },
              {
                icon: BarChart3,
                title: 'Performance Analytics',
                description: 'Detailed insights into bookings, revenue, and market trends',
              },
              {
                icon: DollarSign,
                title: 'Revenue Optimization',
                description: 'Dynamic pricing and marketing to maximize your earnings',
              },
              {
                icon: Shield,
                title: 'Insurance & Protection',
                description: 'Comprehensive coverage for your property and belongings',
              },
              {
                icon: TrendingUp,
                title: 'Market Analysis',
                description: 'Stay ahead with local market insights and recommendations',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#2957c3] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#2957c3]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Maximize Your Property's Potential?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the growing community of property owners earning consistent returns with HabibiStay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-[#2957c3] text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/invest"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Learn About Investing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
