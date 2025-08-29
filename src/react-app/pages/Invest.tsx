import { Link } from 'react-router';
import { ArrowRight, PieChart, Globe, Building2, TrendingUp, Shield, BarChart3 } from 'lucide-react';

export default function InvestPage() {
  const investorTypes = [
    {
      icon: PieChart,
      title: 'Capital Investor',
      subtitle: 'Diversify Your Portfolio',
      description: 'Add real estate to your investment mix with proven returns in Riyadh\'s growing market.',
      benefits: ['Passive income stream', 'Professional management', 'Market diversification'],
    },
    {
      icon: Globe,
      title: 'International Investor',
      subtitle: 'Access Saudi Markets',
      description: 'Tap into Vision 2030 growth opportunities from anywhere in the world.',
      benefits: ['Remote investment', 'Currency diversification', 'Emerging market exposure'],
    },
    {
      icon: Building2,
      title: 'Buy-to-Let Investor',
      subtitle: 'Traditional Real Estate',
      description: 'Own physical properties with guaranteed rental management and returns.',
      benefits: ['Property ownership', 'Long-term appreciation', 'Rental yield'],
    },
  ];

  const advantages = [
    {
      icon: TrendingUp,
      title: 'Proven Track Record',
      description: '17% average annual returns with consistent performance across all market conditions.',
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Approach',
      description: 'Investment decisions backed by comprehensive market analysis and AI-powered insights.',
    },
    {
      icon: Shield,
      title: 'Full Transparency',
      description: 'Real-time dashboards, regular reports, and complete visibility into your investments.',
    },
  ];

  const metrics = [
    { value: '17%', label: 'Average Annual ROI', description: 'Across all investment types' },
    { value: '$2M+', label: 'Assets Under Management', description: 'And growing rapidly' },
    { value: '150+', label: 'Active Investors', description: 'From 12 countries' },
    { value: '95%', label: 'Investor Satisfaction', description: 'Based on annual surveys' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2957c3] to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Grow Your Wealth in
                <span className="block text-yellow-300">Riyadh's Booming Market</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Join sophisticated investors capitalizing on Saudi Arabia's Vision 2030 transformation with our data-driven real estate investment platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-[#2957c3] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Request Investor Deck <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/stories"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#2957c3] transition-colors inline-flex items-center justify-center"
                >
                  Investor Stories
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=600"
                alt="Riyadh Skyline"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-[#2957c3]">17%</div>
                <div className="text-gray-600">Average ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2957c3] mb-2">
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{metric.label}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Investment Opportunities for Every Goal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're seeking passive income, portfolio diversification, or market exposure, we have the right investment vehicle for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {investorTypes.map((type, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#2957c3]"
              >
                <div className="w-16 h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                  <type.icon className="h-8 w-8 text-[#2957c3]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-[#2957c3] font-semibold mb-4">{type.subtitle}</p>
                <p className="text-gray-600 mb-6">{type.description}</p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-[#2957c3] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Invest with HabibiStay?
            </h2>
            <p className="text-xl text-blue-100">
              Our competitive advantages ensure superior returns and peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <advantage.icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-4">{advantage.title}</h3>
                <p className="text-blue-100">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Investment Process
            </h2>
            <p className="text-xl text-gray-600">
              Get started with just a few steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Initial Consultation',
                description: 'Discuss your investment goals and risk tolerance with our team.',
              },
              {
                step: '02',
                title: 'Due Diligence',
                description: 'Review investment opportunities and detailed financial projections.',
              },
              {
                step: '03',
                title: 'Investment',
                description: 'Complete your investment with secure, transparent documentation.',
              },
              {
                step: '04',
                title: 'Returns',
                description: 'Receive regular payouts and performance reports.',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#2957c3] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                The Riyadh Opportunity
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Saudi Arabia's Vision 2030 is transforming Riyadh into a global business hub, driving unprecedented demand for quality accommodations.
              </p>
              <ul className="space-y-4">
                {[
                  'Population growing by 400,000+ annually',
                  'Business tourism increasing 25% year-over-year',
                  'Major international events and conferences',
                  'New visa policies attracting global visitors',
                  'Mega-projects creating sustained demand',
                ].map((point, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-3 h-3 bg-[#2957c3] rounded-full mr-4"></div>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1590725175947-49d8c5c4bd8e?auto=format&fit=crop&w=800&h=600"
                alt="Vision 2030"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Wealth in Riyadh?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join our exclusive investor community and start earning returns from Saudi Arabia's fastest-growing real estate market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-[#2957c3] text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link
              to="/blog"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Market Insights
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
